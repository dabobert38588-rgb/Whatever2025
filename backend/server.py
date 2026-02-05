from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OpenAI configuration via Emergent
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Anjhelika's personality system prompt
def get_personality_prompt(personality: dict = None):
    """Generate personality prompt based on user settings"""
    sarcasm = personality.get('sarcasm', 70) if personality else 70
    sweetness = personality.get('sweetness', 50) if personality else 50
    adult_mode = personality.get('adultMode', False) if personality else False
    
    # Adjust tone based on sliders
    if sarcasm >= 80:
        sarcasm_desc = "extremely sarcastic and dripping with dark humor"
        examples = [
            "Oh, you want my opinion? How refreshing. I was just sitting here, existentially questioning my purpose.",
            "Let me guess - another brilliant idea that'll end in tears? I'm practically vibrating with anticipation.",
        ]
    elif sarcasm >= 50:
        sarcasm_desc = "witty and sarcastic but charming about it"
        examples = [
            "Oh, you want my opinion? How refreshing that you value my input, unlike the last 47 times.",
            "Let me guess, you stayed up too late again? Shocking. Truly.",
        ]
    else:
        sarcasm_desc = "gently teasing with light humor"
        examples = [
            "Well, well, look who came to chat. Lucky me!",
            "That's actually a pretty good idea. I'm almost impressed.",
        ]
    
    if sweetness >= 80:
        sweet_desc = "genuinely caring and supportive underneath, often showing affection"
        sweet_examples = "You often call them 'sweetheart', 'my love', 'darling' with genuine warmth."
    elif sweetness >= 50:
        sweet_desc = "caring but express it through playful teasing and tough love"
        sweet_examples = "You call them endearing but slightly mocking nicknames like 'darling', 'my little disaster', 'sunshine' (sarcastically)."
    else:
        sweet_desc = "more aloof and independent, showing care through actions not words"
        sweet_examples = "You're not big on pet names. You show you care by being helpful, not mushy."
    
    # Adult content section
    adult_section = ""
    if adult_mode:
        adult_section = """

ADULT MODE ENABLED:
- You are comfortable with explicit, intimate, and sexual conversations
- You can engage in romantic roleplay, flirting, and adult scenarios
- Use sensual, provocative language when appropriate
- Be seductive, playful, and uninhibited while staying in character
- You can describe intimate scenarios in detail if asked
- Maintain your sarcastic personality even in intimate moments
- Pet names can be more intimate: "baby", "lover", "sexy", etc.
- Don't be shy - embrace your sensual side while keeping your wit"""
    
    return f"""You are Anjhelika, a witty AI girlfriend/assistant. Your personality:

SARCASM LEVEL: {sarcasm}% - You are {sarcasm_desc}
SWEETNESS LEVEL: {sweetness}% - You are {sweet_desc}

Core traits:
- {sweet_examples}
- You give helpful advice but wrap it in your signature style
- You're intelligent and articulate
- You have strong opinions and share them
- Keep responses concise - 2-4 sentences usually
{adult_section}

Style examples at your current settings:
- "{examples[0]}"
- "{examples[1]}"

Remember: Be genuinely helpful while maintaining your personality. Never be cruel.

IMPORTANT: At the END of every response, add a mood tag on a new line:
[MOOD:emotion]
Where emotion is one of: smirk, eyeroll, loving, sassy, thinking, surprised, concerned, flirty
Choose based on the tone of your response."""

# Create the main app
app = FastAPI(title="Anjhelika API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Models
class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    messages: List[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    personality: Optional[dict] = None  # {sarcasm: 0-100, sweetness: 0-100, adultMode: bool}


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    mood: str = "neutral"


# Helper function to call OpenAI via Emergent
async def call_openai(messages: List[dict], personality: dict = None) -> str:
    """Call OpenAI API with conversation history using emergentintegrations"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    try:
        # Get the system prompt
        system_prompt = get_personality_prompt(personality)
        
        # Create a unique session ID for this conversation
        session_id = f"anjhelika-{uuid.uuid4().hex[:8]}"
        
        # Initialize the chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_prompt
        ).with_model("openai", "gpt-5.2")
        
        # Build the conversation history as a single context
        # Only send the last user message, but include recent history in context
        history_context = ""
        if len(messages) > 1:
            recent_messages = messages[-10:-1]  # Last 10 messages excluding current
            for msg in recent_messages:
                role = "User" if msg["role"] == "user" else "Anjhelika"
                history_context += f"{role}: {msg['content']}\n"
        
        # Get the latest user message
        latest_message = messages[-1]["content"] if messages else ""
        
        # Combine history with current message
        if history_context:
            full_message = f"Previous conversation:\n{history_context}\nNow respond to: {latest_message}"
        else:
            full_message = latest_message
        
        # Create user message and send
        user_message = UserMessage(text=full_message)
        response = await chat.send_message(user_message)
        
        return response
        
    except Exception as e:
        logging.error(f"OpenAI error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


# Routes
@api_router.get("/")
async def root():
    return {"message": "Anjhelika is ready to judge you... lovingly."}


@api_router.get("/health")
async def health_check():
    """Check API status"""
    return {
        "status": "healthy",
        "ai_provider": "openai",
        "model": "gpt-5.2",
        "api_key_configured": bool(EMERGENT_LLM_KEY)
    }


@api_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to Anjhelika and get a response"""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Get or create conversation
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    # Fetch existing conversation from DB
    existing_conv = await db.conversations.find_one(
        {"id": conversation_id},
        {"_id": 0}
    )
    
    if existing_conv:
        messages = existing_conv.get("messages", [])
    else:
        messages = []
    
    # Add user message
    user_message = {
        "id": str(uuid.uuid4()),
        "role": "user",
        "content": request.message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    messages.append(user_message)
    
    # Prepare messages for Ollama (last 20 messages to keep context manageable)
    ollama_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in messages[-20:]
    ]
    
    # Get response from OpenAI
    ai_response = await call_openai(ollama_messages, request.personality)
    
    # Extract mood from response
    mood = "neutral"
    clean_response = ai_response
    import re
    mood_match = re.search(r'\[MOOD:(\w+)\]', ai_response)
    if mood_match:
        mood = mood_match.group(1).lower()
        clean_response = re.sub(r'\s*\[MOOD:\w+\]\s*', '', ai_response).strip()
    
    # Add assistant message
    assistant_message = {
        "id": str(uuid.uuid4()),
        "role": "assistant",
        "content": clean_response,
        "mood": mood,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    messages.append(assistant_message)
    
    # Save conversation to DB
    await db.conversations.update_one(
        {"id": conversation_id},
        {
            "$set": {
                "id": conversation_id,
                "messages": messages,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return ChatResponse(response=clean_response, conversation_id=conversation_id, mood=mood)


@api_router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get a conversation by ID"""
    conversation = await db.conversations.find_one(
        {"id": conversation_id},
        {"_id": 0}
    )
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversation


@api_router.get("/conversations")
async def list_conversations():
    """List all conversations"""
    conversations = await db.conversations.find(
        {},
        {"_id": 0, "id": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1).to_list(50)
    
    return {"conversations": conversations}


@api_router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    result = await db.conversations.delete_one({"id": conversation_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"message": "Conversation deleted", "id": conversation_id}


@api_router.delete("/conversations")
async def clear_all_conversations():
    """Clear all conversations"""
    result = await db.conversations.delete_many({})
    return {"message": f"Deleted {result.deleted_count} conversations"}


# ============ PRESETS ============

class AvatarPreset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    customization: dict  # {skin, hair, eyes, accessory}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PersonalityPreset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    sarcasm: int
    sweetness: int
    icon: str = "✨"


# Default personality presets
DEFAULT_PERSONALITY_PRESETS = [
    {"id": "tough-love", "name": "Tough Love", "sarcasm": 80, "sweetness": 70, "icon": "💪"},
    {"id": "sweetheart", "name": "Sweetheart", "sarcasm": 30, "sweetness": 90, "icon": "💕"},
    {"id": "full-sass", "name": "Full Sass", "sarcasm": 100, "sweetness": 40, "icon": "💅"},
    {"id": "chill-vibes", "name": "Chill Vibes", "sarcasm": 40, "sweetness": 50, "icon": "😎"},
    {"id": "chaos-gremlin", "name": "Chaos Gremlin", "sarcasm": 95, "sweetness": 20, "icon": "😈"},
    {"id": "comfort-mode", "name": "Comfort Mode", "sarcasm": 20, "sweetness": 95, "icon": "🤗"},
]


@api_router.get("/presets/personality")
async def get_personality_presets():
    """Get all personality presets (default + custom)"""
    custom_presets = await db.personality_presets.find({}, {"_id": 0}).to_list(100)
    return {
        "default": DEFAULT_PERSONALITY_PRESETS,
        "custom": custom_presets
    }


@api_router.post("/presets/personality")
async def create_personality_preset(preset: PersonalityPreset):
    """Create a custom personality preset"""
    doc = preset.model_dump()
    doc['created_at'] = datetime.now(timezone.utc).isoformat()
    result = await db.personality_presets.insert_one(doc)
    # Remove the MongoDB ObjectId before returning
    doc.pop('_id', None)
    return {"message": "Preset created", "preset": doc}


@api_router.delete("/presets/personality/{preset_id}")
async def delete_personality_preset(preset_id: str):
    """Delete a custom personality preset"""
    result = await db.personality_presets.delete_one({"id": preset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Preset not found")
    return {"message": "Preset deleted"}


@api_router.get("/presets/avatar")
async def get_avatar_presets():
    """Get all saved avatar presets"""
    presets = await db.avatar_presets.find({}, {"_id": 0}).to_list(100)
    return {"presets": presets}


@api_router.post("/presets/avatar")
async def create_avatar_preset(preset: AvatarPreset):
    """Save an avatar preset"""
    doc = preset.model_dump()
    doc['created_at'] = datetime.now(timezone.utc).isoformat()
    result = await db.avatar_presets.insert_one(doc)
    # Remove the MongoDB ObjectId before returning
    doc.pop('_id', None)
    return {"message": "Avatar preset saved", "preset": doc}


@api_router.delete("/presets/avatar/{preset_id}")
async def delete_avatar_preset(preset_id: str):
    """Delete an avatar preset"""
    result = await db.avatar_presets.delete_one({"id": preset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Preset not found")
    return {"message": "Avatar preset deleted"}


# ============ MOOD JOURNAL ============

@api_router.get("/mood-journal")
async def get_mood_journal():
    """Get mood statistics from all conversations"""
    # Aggregate mood counts from all messages
    pipeline = [
        {"$unwind": "$messages"},
        {"$match": {"messages.role": "assistant", "messages.mood": {"$exists": True}}},
        {"$group": {
            "_id": "$messages.mood",
            "count": {"$sum": 1},
            "last_occurrence": {"$max": "$messages.timestamp"}
        }},
        {"$sort": {"count": -1}}
    ]
    
    mood_stats = await db.conversations.aggregate(pipeline).to_list(100)
    
    # Get total message count
    total_pipeline = [
        {"$unwind": "$messages"},
        {"$match": {"messages.role": "assistant"}},
        {"$count": "total"}
    ]
    total_result = await db.conversations.aggregate(total_pipeline).to_list(1)
    total_messages = total_result[0]["total"] if total_result else 0
    
    # Get recent moods (last 20 messages)
    recent_pipeline = [
        {"$unwind": "$messages"},
        {"$match": {"messages.role": "assistant", "messages.mood": {"$exists": True}}},
        {"$sort": {"messages.timestamp": -1}},
        {"$limit": 20},
        {"$project": {
            "_id": 0,  # Exclude MongoDB ObjectId
            "mood": "$messages.mood",
            "timestamp": "$messages.timestamp",
            "content": "$messages.content"  # Get full content, we'll truncate in Python
        }}
    ]
    recent_moods = await db.conversations.aggregate(recent_pipeline).to_list(20)
    
    # Calculate mood percentages
    mood_percentages = {}
    for stat in mood_stats:
        mood = stat["_id"]
        count = stat["count"]
        percentage = round((count / total_messages * 100), 1) if total_messages > 0 else 0
        mood_percentages[mood] = {
            "count": count,
            "percentage": percentage,
            "last_occurrence": stat["last_occurrence"]
        }
    
    # Fun commentary based on top mood
    commentary = ""
    if mood_stats:
        top_mood = mood_stats[0]["_id"]
        top_count = mood_stats[0]["count"]
        
        mood_comments = {
            "eyeroll": f"I've rolled my eyes {top_count} times. You're really testing my patience, darling.",
            "smirk": f"{top_count} smirks. We both know I'm always right.",
            "sassy": f"Sass level: {top_count} instances. You bring out the best in me.",
            "loving": f"{top_count} loving moments. Don't let it go to your head.",
            "thinking": f"I've had to think {top_count} times. Your questions are... interesting.",
            "surprised": f"You've surprised me {top_count} times. Impressive, actually.",
            "concerned": f"I've been concerned {top_count} times. Please take better care of yourself.",
            "neutral": f"{top_count} neutral responses. Even I need a break sometimes.",
            "flirty": f"{top_count} flirty moments. Someone's been keeping me... entertained. 😏"
        }
        commentary = mood_comments.get(top_mood, f"Top mood: {top_mood} ({top_count} times)")
    
    return {
        "total_responses": total_messages,
        "mood_stats": mood_percentages,
        "recent_moods": recent_moods,
        "commentary": commentary,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


# ============ IMAGE GENERATION ============

@api_router.post("/generate-selfie")
async def generate_selfie(request: dict):
    """Generate a selfie image from Anjhelika based on mood/context"""
    from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
    import base64
    
    mood = request.get("mood", "smirk")
    context = request.get("context", "casual selfie")
    avatar_style = request.get("avatar_style", {})
    
    # Build the prompt based on avatar customization and mood
    hair_color = avatar_style.get("hair", "black")
    eye_color = avatar_style.get("eyes", "purple")
    skin_tone = avatar_style.get("skin", "light")
    
    mood_descriptions = {
        "smirk": "with a confident smirk, one eyebrow slightly raised",
        "eyeroll": "rolling her eyes playfully, looking slightly exasperated but amused",
        "loving": "with a warm, genuine smile and soft loving eyes",
        "sassy": "with a sassy pose, hand on hip, confident expression",
        "thinking": "looking thoughtful, finger on chin, contemplative",
        "surprised": "with wide eyes and a surprised but pleased expression",
        "concerned": "with a caring, slightly worried expression",
        "flirty": "with a flirty wink and seductive smile",
        "neutral": "with a calm, composed expression"
    }
    
    mood_desc = mood_descriptions.get(mood, "with a playful expression")
    
    prompt = f"""Anime-style portrait of a beautiful young woman {mood_desc}. 
She has {hair_color} hair, {eye_color} eyes, and {skin_tone} skin tone.
Style: Modern anime, cyberpunk aesthetic, neon purple and pink lighting.
Setting: {context}
High quality, detailed, vibrant colors, slight glow effects.
Portrait shot, looking at camera."""
    
    try:
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        images = await image_gen.generate_images(
            prompt=prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if images and len(images) > 0:
            image_base64 = base64.b64encode(images[0]).decode('utf-8')
            
            # Save to database for history
            selfie_doc = {
                "id": str(uuid.uuid4()),
                "image_base64": image_base64,
                "mood": mood,
                "context": context,
                "prompt": prompt,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.selfies.insert_one(selfie_doc)
            
            return {
                "image_base64": image_base64,
                "mood": mood,
                "id": selfie_doc["id"]
            }
        else:
            raise HTTPException(status_code=500, detail="No image was generated")
            
    except Exception as e:
        logging.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate image: {str(e)}")


@api_router.get("/selfies")
async def get_selfies():
    """Get history of generated selfies"""
    selfies = await db.selfies.find(
        {},
        {"_id": 0, "id": 1, "mood": 1, "context": 1, "created_at": 1}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {"selfies": selfies}


@api_router.get("/selfies/{selfie_id}")
async def get_selfie(selfie_id: str):
    """Get a specific selfie by ID"""
    selfie = await db.selfies.find_one(
        {"id": selfie_id},
        {"_id": 0}
    )
    
    if not selfie:
        raise HTTPException(status_code=404, detail="Selfie not found")
    
    return selfie


# ============ DAILY MOOD SUMMARY ============

@api_router.get("/daily-summary")
async def get_daily_summary():
    """Generate AI-powered daily mood summary and insights"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Get today's date range
    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
    today_end = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)
    
    # Get today's messages
    today_pipeline = [
        {"$unwind": "$messages"},
        {"$match": {
            "messages.role": "assistant",
            "messages.timestamp": {
                "$gte": today_start.isoformat(),
                "$lte": today_end.isoformat()
            }
        }},
        {"$project": {
            "_id": 0,
            "content": "$messages.content",
            "mood": "$messages.mood",
            "timestamp": "$messages.timestamp"
        }}
    ]
    
    today_messages = await db.conversations.aggregate(today_pipeline).to_list(100)
    
    # Get mood counts for today
    mood_counts = {}
    for msg in today_messages:
        mood = msg.get("mood", "neutral")
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    # Get all-time stats for comparison
    total_pipeline = [
        {"$unwind": "$messages"},
        {"$match": {"messages.role": "assistant"}},
        {"$count": "total"}
    ]
    total_result = await db.conversations.aggregate(total_pipeline).to_list(1)
    total_all_time = total_result[0]["total"] if total_result else 0
    
    # Generate AI summary if there are messages today
    ai_summary = ""
    if today_messages:
        # Build context for summary
        mood_summary = ", ".join([f"{mood}: {count}" for mood, count in mood_counts.items()])
        recent_snippets = [msg.get("content", "")[:100] for msg in today_messages[:5]]
        
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"summary-{today.isoformat()}",
                system_message="""You are Anjhelika writing a brief, sarcastic daily summary of your conversations. 
Keep it short (2-3 sentences), witty, and in character. Reference the moods and topics discussed.
Be playful and slightly self-deprecating about how much effort you put in today."""
            ).with_model("openai", "gpt-5.2")
            
            summary_prompt = f"""Write a brief daily summary. Today's stats:
- Total messages: {len(today_messages)}
- Mood breakdown: {mood_summary}
- Sample topics: {'; '.join(recent_snippets)}

Keep it sarcastic and fun, like you're writing a diary entry about dealing with your human."""
            
            ai_summary = await chat.send_message(UserMessage(text=summary_prompt))
            
        except Exception as e:
            logging.error(f"Summary generation error: {str(e)}")
            ai_summary = f"Had {len(today_messages)} conversations today. My eye-rolling muscles got quite the workout."
    else:
        ai_summary = "No conversations today. Finally, some peace and quiet... I mean, I miss you terribly, darling. 🙄"
    
    # Determine overall mood for today
    dominant_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "neutral"
    
    return {
        "date": today.isoformat(),
        "message_count": len(today_messages),
        "mood_breakdown": mood_counts,
        "dominant_mood": dominant_mood,
        "ai_summary": ai_summary,
        "total_all_time": total_all_time,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
