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

## Tech Stack
- Frontend: React 19, TailwindCSS, Framer Motion, shadcn/ui
- Backend: FastAPI, Motor (async MongoDB), httpx (Ollama client)
- Database: MongoDB
- LLM: Ollama with qwen3:1.7b (CPU-optimized)
- Voice: Web Speech API (browser-native)

## P0/P1/P2 Features Remaining

### P0 (Critical)
- None - All core features complete

### P1 (Important)
- Voice wake word improvements (better accuracy)
- Custom avatar customization
- Export conversation history

### P2 (Nice to Have)
- Personality adjustment sliders
- Mood tracking over time
- Daily check-ins and reminders
- Multiple AI personas
