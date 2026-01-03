# Anjhelika - AI Girlfriend/Assistant PRD

## Original Problem Statement
Build a local smart AI girlfriend/assistant named Anjhelika with:
- Dark humor and sarcastic personality (mixed with sweet/supportive/witty/smart)
- Bidirectional voice chat (speech-to-text user input, text-to-speech AI responses)
- Powered by Ollama with Qwen3 model (local LLM)
- Surprise theme (resulted in Cyber-Noir aesthetic)

## User Personas
- **Primary User**: Individual seeking a fun, personalized AI companion with attitude
- **Use Case**: Daily conversations, advice, companionship with a sarcastic twist

## Core Requirements (Static)
1. ✅ AI Chat with personality (dark humor, sarcasm)
2. ✅ Voice input via Web Speech API (STT)
3. ✅ Voice output via Web Speech API (TTS)
4. ✅ Ollama integration for local LLM
5. ✅ Conversation persistence (MongoDB)
6. ✅ Modern UI with distinctive theme

## What's Been Implemented (January 3, 2025)

### Backend (FastAPI)
- `/api/chat` - POST endpoint for chat with Ollama integration
- `/api/health` - Health check with Ollama status
- `/api/conversations` - List all conversations
- `/api/conversations/{id}` - Get/Delete specific conversation
- Anjhelika personality system prompt embedded
- MongoDB conversation storage

### Frontend (React)
- **VoiceOrb**: Central interactive element with state animations (idle, listening, thinking, speaking)
- **ChatMessage**: Styled message bubbles with speak button
- **ControlBar**: Floating control bar (mic, mute, clear, settings)
- **SettingsPanel**: Voice config, AI status display
- **Custom Hooks**: useSpeechRecognition, useSpeechSynthesis

### Design System
- **Theme**: Cyber-Noir (dark mode only)
- **Colors**: Deep black bg, Electric Purple primary (#D946EF), Toxic Green secondary (#A3E635)
- **Typography**: Unbounded (headings), Manrope (body), JetBrains Mono (code)
- **Effects**: Glassmorphism, neon glows, smooth animations

## Tech Stack
- Frontend: React 19, TailwindCSS, Framer Motion, shadcn/ui
- Backend: FastAPI, Motor (async MongoDB), httpx (Ollama client)
- Database: MongoDB
- LLM: Ollama with Qwen3 (local)
- Voice: Web Speech API (browser-native)

## P0/P1/P2 Features Remaining

### P0 (Critical)
- None - MVP complete

### P1 (Important)
- Conversation history list view
- Multiple conversation support
- Voice wake word detection

### P2 (Nice to Have)
- Custom avatar upload
- Personality adjustment sliders
- Mood tracking over time
- Daily check-ins and reminders
- Export conversation history

## Next Tasks
1. User needs to install and run Ollama locally with Qwen3 model
2. Configure OLLAMA_URL if not on localhost:11434
3. Consider adding conversation list sidebar
4. Add voice customization with more TTS engines
