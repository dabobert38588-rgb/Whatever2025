import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

import VoiceOrb from './components/VoiceOrb';
import ChatMessage from './components/ChatMessage';
import ControlBar from './components/ControlBar';
import SettingsPanel from './components/SettingsPanel';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { ScrollArea } from './components/ui/scroll-area';

import useSpeechRecognition from './hooks/useSpeechRecognition';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';

import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  // State
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState('checking');
  const [ollamaModel, setOllamaModel] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [currentSpeakingId, setCurrentSpeakingId] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hooks
  const {
    transcript,
    listening,
    browserSupported: sttSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const {
    speak,
    stop: stopSpeaking,
    speaking,
    browserSupported: ttsSupported,
    voices,
    selectedVoiceIndex,
    setSelectedVoiceIndex
  } = useSpeechSynthesis();

  // Determine orb state
  const getOrbState = () => {
    if (listening) return 'listening';
    if (isLoading) return 'thinking';
    if (speaking) return 'speaking';
    return 'idle';
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update input with transcript
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Check Ollama status on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get(`${API}/health`);
        setOllamaStatus(response.data.ollama);
        setOllamaModel(response.data.configured_model);
        
        if (response.data.ollama !== 'connected') {
          toast.error('Ollama is not connected. Make sure it\'s running locally.', {
            duration: 5000
          });
        }
      } catch (error) {
        setOllamaStatus('disconnected');
        toast.error('Cannot connect to backend server.');
      }
    };
    
    checkHealth();
  }, []);

  // Send message function
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText?.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    resetTranscript();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: messageText.trim(),
        conversation_id: conversationId
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationId(response.data.conversation_id);

      // Speak the response if not muted
      if (!isMuted && ttsSupported) {
        setCurrentSpeakingId(aiMessage.id);
        speak(response.data.response, { rate: speechRate, pitch: speechPitch });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to get response from Anjhelika';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading, isMuted, ttsSupported, speak, speechRate, speechPitch, resetTranscript]);

  // Handle voice input completion
  useEffect(() => {
    if (!listening && transcript && transcript.trim()) {
      // Small delay to ensure transcript is final
      const timer = setTimeout(() => {
        sendMessage(transcript);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [listening, transcript, sendMessage]);

  // Clear speaking state when done
  useEffect(() => {
    if (!speaking) {
      setCurrentSpeakingId(null);
    }
  }, [speaking]);

  // Handle mic click
  const handleMicClick = () => {
    if (listening) {
      stopListening();
    } else {
      if (speaking) {
        stopSpeaking();
      }
      startListening();
    }
  };

  // Handle orb click
  const handleOrbClick = () => {
    if (listening) {
      stopListening();
    } else if (speaking) {
      stopSpeaking();
    } else {
      startListening();
    }
  };

  // Handle text input submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  // Handle speak individual message
  const handleSpeakMessage = (content) => {
    if (speaking) {
      stopSpeaking();
    } else {
      speak(content, { rate: speechRate, pitch: speechPitch });
    }
  };

  // Clear conversation
  const handleClearChat = async () => {
    if (conversationId) {
      try {
        await axios.delete(`${API}/conversations/${conversationId}`);
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
    setMessages([]);
    setConversationId(null);
    stopSpeaking();
    toast.success('Conversation cleared. Fresh start, darling.');
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))'
          }
        }}
      />

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 text-center"
        >
          <h1 
            className="text-3xl md:text-4xl font-bold text-gradient-primary"
            style={{ fontFamily: 'Unbounded, sans-serif' }}
          >
            Anjhelika
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your sarcastic AI companion with a heart of... well, code.
          </p>
        </motion.header>

        {/* Chat area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
          <AnimatePresence mode="wait">
            {!hasMessages ? (
              /* Idle state with orb */
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-8"
              >
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 neon-primary">
                    <img
                      src="https://images.unsplash.com/photo-1634910440823-193b061d28a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjB3b21hbiUyMHBvcnRyYWl0JTIwbmVvbnxlbnwwfHx8fDE3Njc0MTExMjF8MA&ixlib=rb-4.1.0&q=85&w=300"
                      alt="Anjhelika"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                {/* Voice Orb */}
                <VoiceOrb
                  state={getOrbState()}
                  onClick={handleOrbClick}
                  size="lg"
                />

                {/* Greeting */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-muted-foreground max-w-md"
                >
                  {sttSupported ? (
                    "Go ahead, tap the orb and tell me your problems. I promise to be only slightly judgmental."
                  ) : (
                    "Your browser doesn't support speech recognition. Type below instead, you tech-challenged darling."
                  )}
                </motion.p>

                {/* Text input for non-voice */}
                <form onSubmit={handleSubmit} className="w-full max-w-md">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Or type here if you're shy..."
                      className="flex-1 bg-card border-border input-glow"
                      disabled={isLoading}
                      data-testid="chat-input"
                    />
                    <Button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="rounded-full neon-primary"
                      data-testid="send-button"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>

                {/* Status indicators */}
                {!sttSupported && (
                  <p className="text-xs text-destructive">Speech recognition not supported</p>
                )}
                {ollamaStatus !== 'connected' && (
                  <p className="text-xs text-destructive">
                    Ollama disconnected - Start Ollama to chat
                  </p>
                )}
              </motion.div>
            ) : (
              /* Chat messages */
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-2xl flex flex-col h-full"
              >
                {/* Small orb indicator */}
                <div className="flex justify-center mb-4">
                  <VoiceOrb
                    state={getOrbState()}
                    onClick={handleOrbClick}
                    size="sm"
                  />
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 pr-4" data-testid="messages-container">
                  <div className="space-y-4 pb-4">
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onSpeak={handleSpeakMessage}
                        isSpeaking={speaking && currentSpeakingId === message.id}
                      />
                    ))}
                    
                    {/* Loading indicator */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="message-ai px-4 py-3 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">
                            Crafting a perfectly sarcastic response...
                          </span>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input area */}
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 mb-24"
                >
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={listening ? "Listening..." : "Type your message..."}
                      className="flex-1 bg-card border-border input-glow"
                      disabled={isLoading || listening}
                      data-testid="chat-input"
                    />
                    <Button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="rounded-full neon-primary"
                      data-testid="send-button"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Bar */}
      <ControlBar
        isListening={listening}
        isSpeaking={speaking}
        isMuted={isMuted}
        onMicClick={handleMicClick}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onSettingsClick={() => setShowSettings(true)}
        onClearChat={handleClearChat}
        disabled={ollamaStatus !== 'connected'}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        voices={voices}
        selectedVoiceIndex={selectedVoiceIndex}
        onVoiceChange={setSelectedVoiceIndex}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        speechPitch={speechPitch}
        onSpeechPitchChange={setSpeechPitch}
        ollamaStatus={ollamaStatus}
        ollamaModel={ollamaModel}
      />
    </div>
  );
}

export default App;
