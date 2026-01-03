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

# Ollama configuration
OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'qwen3')

# Anjhelika's personality system prompt
def get_personality_prompt(personality: dict = None):
    """Generate personality prompt based on user settings"""
    sarcasm = personality.get('sarcasm', 70) if personality else 70
    sweetness = personality.get('sweetness', 50) if personality else 50
    
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
    
    return f"""You are Anjhelika, a witty AI girlfriend/assistant. Your personality:

SARCASM LEVEL: {sarcasm}% - You are {sarcasm_desc}
SWEETNESS LEVEL: {sweetness}% - You are {sweet_desc}

Core traits:
- {sweet_examples}
- You give helpful advice but wrap it in your signature style
- You're intelligent and articulate
- You have strong opinions and share them
- Keep responses concise - 2-4 sentences usually

Style examples at your current settings:
- "{examples[0]}"
- "{examples[1]}"

Remember: Be genuinely helpful while maintaining your personality. Never be cruel.

IMPORTANT: At the END of every response, add a mood tag on a new line:
[MOOD:emotion]
Where emotion is one of: smirk, eyeroll, loving, sassy, thinking, surprised, concerned
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
    personality: Optional[dict] = None  # {sarcasm: 0-100, sweetness: 0-100}


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    mood: str = "neutral"


# Helper function to call Ollama
async def call_ollama(messages: List[dict], personality: dict = None) -> str:
    """Call Ollama API with conversation history"""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Prepare messages with dynamic system prompt
            system_prompt = get_personality_prompt(personality)
            full_messages = [
                {"role": "system", "content": system_prompt}
            ] + messages
            
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": full_messages,
                    "stream": False
                }
            )
            
            if response.status_code != 200:
                logging.error(f"Ollama error: {response.text}")
                raise HTTPException(status_code=502, detail="Failed to get response from Ollama")
            
            data = response.json()
            return data.get("message", {}).get("content", "")
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Ollama request timed out")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Cannot connect to Ollama. Make sure it's running locally.")
    except Exception as e:
        logging.error(f"Ollama error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")


# Routes
@api_router.get("/")
async def root():
    return {"message": "Anjhelika is ready to judge you... lovingly."}


@api_router.get("/health")
async def health_check():
    """Check if Ollama is available"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            ollama_status = "connected" if response.status_code == 200 else "error"
            models = response.json().get("models", []) if response.status_code == 200 else []
            model_names = [m.get("name", "") for m in models]
    except Exception as e:
        ollama_status = "disconnected"
        model_names = []
    
    return {
        "status": "healthy",
        "ollama": ollama_status,
        "available_models": model_names,
        "configured_model": OLLAMA_MODEL
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
    
    # Get response from Ollama
    ai_response = await call_ollama(ollama_messages, request.personality)
    
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
