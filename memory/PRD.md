# Anjhelika - AI Girlfriend/Assistant PRD

## Original Problem Statement
Build a local smart AI girlfriend/assistant named Anjhelika with:
- Dark humor and sarcastic personality (mixed with sweet/supportive/witty/smart)
- Bidirectional voice chat (speech-to-text user input, text-to-speech AI responses)
- Powered by Ollama with Qwen3 model (local LLM) - CPU optimized with qwen3:1.7b
- Mood-based animated avatar expressions
- Conversation history sidebar
- Wake word detection ("Hey Anjhelika")

## User Personas
- **Primary User**: Individual seeking a fun, personalized AI companion with attitude
- **Use Case**: Daily conversations, advice, companionship with a sarcastic twist

## Core Requirements (Static)
1. ✅ AI Chat with personality (dark humor, sarcasm)
2. ✅ Voice input via Web Speech API (STT)
3. ✅ Voice output via Web Speech API (TTS)
4. ✅ Ollama integration for local LLM (CPU-friendly qwen3:1.7b)
5. ✅ Conversation persistence (MongoDB)
6. ✅ Modern UI with Cyber-Noir theme
7. ✅ Mood-based avatar animations
8. ✅ Conversation history sidebar
9. ✅ Wake word detection

## What's Been Implemented

### Phase 1 - MVP (January 3, 2025)
- Basic chat interface with VoiceOrb
- Ollama integration with personality prompt
- Speech-to-text and text-to-speech
- MongoDB conversation storage
- Cyber-noir dark theme

### Phase 2 - Enhanced Features (January 3, 2025)
- **Animated SVG Avatar**: Custom drawn face with mood expressions
  - Moods: neutral, smirk, eyeroll, loving, sassy, thinking, surprised, concerned
  - AI responds with [MOOD:emotion] tag, parsed and displayed
  - Speaking animation on mouth
- **Conversation Sidebar**: 
  - List of past conversations
  - New chat button
  - Delete individual conversations
  - Preview text for each conversation
- **Wake Word Detection**:
  - Toggle button in header
  - Listens for "Hey Anjhelika" (and variations)
  - Auto-activates voice input when detected
- **CPU Optimization**: Changed default model to qwen3:1.7b for better CPU performance

### Phase 3 - Customization Features (January 3, 2025)
- **Personality Sliders**:
  - Sarcasm Level (0-100%): Controls how snarky vs gentle she is
  - Sweetness Level (0-100%): Controls how affectionate vs independent she is
  - Dynamic system prompt generation based on settings
  - "Current Vibe" preview shows personality description
- **Avatar Customization**:
  - Skin Tone: 6 options (light, medium, olive, tan, brown, dark)
  - Hair Color: 8 options (black, brown, blonde, red, purple, blue, pink, white)
  - Eye Color: 8 options (purple, blue, green, brown, amber, red, pink, gray)
  - Earring Color: 8 options + none
  - Live preview in settings panel
- **Settings Panel Redesign**:
  - Organized into 3 tabs: Personality, Avatar, Voice
  - Clean UI with icons and helpful descriptions

### Phase 4 - Presets & Mood Journal (January 3, 2025)
- **Personality Quick Presets**:
  - 6 built-in presets: Tough Love, Sweetheart, Full Sass, Chill Vibes, Chaos Gremlin, Comfort Mode
  - One-click application of sarcasm/sweetness values
  - Save custom presets with name
  - Delete custom presets
- **Avatar Presets**:
  - Save current look with custom name
  - Grid view of saved looks with preview
  - One-click application
  - Delete saved looks
- **Mood Journal**:
  - Tracks all AI response moods from conversations
  - Statistics: Total responses, Top mood with emoji
  - Mood distribution with progress bars
  - Recent moods timeline with previews
  - Sarcastic AI commentary (e.g., "I've rolled my eyes 47 times")
  - Bottom sheet panel with refresh button

### Phase 5 - Adult Mode (January 3, 2025)
- **Adult Mode Toggle**:
  - Off by default with clear toggle in Personality tab
  - Age verification dialog (18+ confirmation required)
  - NSFW warning indicator when enabled
  - Modifies AI personality to allow explicit content
  - New "flirty" mood (😘) for appropriate responses
  - Maintains sarcastic personality even in intimate moments

## Tech Stack
- Frontend: React 19, TailwindCSS, Framer Motion, shadcn/ui
- Backend: FastAPI, Motor (async MongoDB), httpx (Ollama client)
- Database: MongoDB
- LLM: Ollama with qwen3:1.7b (CPU-optimized)
- Voice: Web Speech API (browser-native)

## P0/P1/P2 Features Remaining

### P0 (Critical)
- None - All requested features complete

### P1 (Important)
- Voice wake word accuracy improvements
- Export conversation/mood history
- Mood trends over time (weekly/monthly charts)

### P2 (Nice to Have)
- Daily check-ins and reminders
- Multiple AI personas
- Custom wake word phrases
- Share mood journal stats
