import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { Send, Loader2, Menu, Radio } from 'lucide-react';

import VoiceOrb from './components/VoiceOrb';
import ChatMessage from './components/ChatMessage';
import ControlBar from './components/ControlBar';
import SettingsPanel from './components/SettingsPanel';
import AnimatedAvatar from './components/AnimatedAvatar';
import ConversationSidebar from './components/ConversationSidebar';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { ScrollArea } from './components/ui/scroll-area';

import useSpeechRecognition from './hooks/useSpeechRecognition';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';
import useWakeWord from './hooks/useWakeWord';

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
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState('checking');
  const [ollamaModel, setOllamaModel] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [currentSpeakingId, setCurrentSpeakingId] = useState(null);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [conversations, setConversations] = useState([]);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);

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

  // Wake word handler
  const handleWakeWordDetected = useCallback(() => {
    toast.success("Hey! I'm listening...", { duration: 2000 });
    startListening();
  }, [startListening]);

  const {
    isListeningForWakeWord,
    isEnabled: wakeWordActive,
    startListening: startWakeWord,
    stopListening: stopWakeWord,
    pauseTemporarily: pauseWakeWord
  } = useWakeWord('hey anjhelika', handleWakeWordDetected);

  // Toggle wake word
  const toggleWakeWord = useCallback(() => {
    if (wakeWordActive) {
      stopWakeWord();
      setWakeWordEnabled(false);
      toast.info('Wake word disabled');
    } else {
      startWakeWord();
      setWakeWordEnabled(true);
      toast.success('Say "Hey Anjhelika" to start chatting!');
    }
  }, [wakeWordActive, startWakeWord, stopWakeWord]);

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

  // Check Ollama status and load conversations on mount
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
    
    const loadConversations = async () => {
      try {
        const response = await axios.get(`${API}/conversations`);
        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };
    
    checkHealth();
    loadConversations();
  }, []);

  // Load conversation messages
  const loadConversation = useCallback(async (convId) => {
    try {
      const response = await axios.get(`${API}/conversations/${convId}`);
      setMessages(response.data.messages || []);
      setConversationId(convId);
      
      // Get last mood from messages
      const lastAiMessage = [...(response.data.messages || [])].reverse().find(m => m.role === 'assistant');
      if (lastAiMessage?.mood) {
        setCurrentMood(lastAiMessage.mood);
      }
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  }, []);

  // Send message function
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText?.trim() || isLoading) return;

    // Pause wake word while processing
    if (wakeWordActive) {
      pauseWakeWord(10000);
    }

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
    setCurrentMood('thinking');

    try {
      const response = await axios.post(`${API}/chat`, {
        message: messageText.trim(),
        conversation_id: conversationId
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        mood: response.data.mood,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationId(response.data.conversation_id);
      setCurrentMood(response.data.mood || 'neutral');

      // Update conversations list
      setConversations(prev => {
        const existing = prev.find(c => c.id === response.data.conversation_id);
        if (existing) {
          return prev.map(c => 
            c.id === response.data.conversation_id 
              ? { ...c, updated_at: new Date().toISOString(), preview: messageText.trim().slice(0, 50) }
              : c
          );
        } else {
          return [{ 
            id: response.data.conversation_id, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            preview: messageText.trim().slice(0, 50)
          }, ...prev];
        }
      });

      // Speak the response if not muted
      if (!isMuted && ttsSupported) {
        setCurrentSpeakingId(aiMessage.id);
        speak(response.data.response, { rate: speechRate, pitch: speechPitch });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to get response from Anjhelika';
      toast.error(errorMsg);
      setCurrentMood('concerned');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading, isMuted, ttsSupported, speak, speechRate, speechPitch, resetTranscript, wakeWordActive, pauseWakeWord]);

  // Handle voice input completion
  useEffect(() => {
    if (!listening && transcript && transcript.trim()) {
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
      if (wakeWordActive) {
        pauseWakeWord(10000);
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
      if (wakeWordActive) {
        pauseWakeWord(10000);
      }
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
        setConversations(prev => prev.filter(c => c.id !== conversationId));
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
    setMessages([]);
    setConversationId(null);
    setCurrentMood('neutral');
    stopSpeaking();
    toast.success('Conversation cleared. Fresh start, darling.');
  };

  // New conversation
  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setCurrentMood('neutral');
    setShowSidebar(false);
  };

  // Select conversation
  const handleSelectConversation = (convId) => {
    loadConversation(convId);
    setShowSidebar(false);
  };

  // Delete conversation from sidebar
  const handleDeleteConversation = async (convId) => {
    try {
      await axios.delete(`${API}/conversations/${convId}`);
      setConversations(prev => prev.filter(c => c.id !== convId));
      
      if (conversationId === convId) {
        setMessages([]);
        setConversationId(null);
        setCurrentMood('neutral');
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
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

      {/* Conversation Sidebar */}
      <ConversationSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        conversations={conversations}
        currentConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(true)}
            className="rounded-full"
            data-testid="open-sidebar-btn"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <h1 
              className="text-2xl md:text-3xl font-bold text-gradient-primary"
              style={{ fontFamily: 'Unbounded, sans-serif' }}
            >
              Anjhelika
            </h1>
            <p className="text-xs text-muted-foreground">
              {ollamaStatus === 'connected' ? 'Online' : 'Offline'} • {ollamaModel || 'qwen3:1.7b'}
            </p>
          </div>
          
          <Button
            variant={wakeWordActive ? 'default' : 'ghost'}
            size="icon"
            onClick={toggleWakeWord}
            className={`rounded-full ${wakeWordActive ? 'neon-secondary' : ''}`}
            data-testid="wake-word-toggle"
            title={wakeWordActive ? 'Wake word active' : 'Enable wake word'}
          >
            <Radio className={`h-5 w-5 ${wakeWordActive ? 'text-secondary animate-pulse' : ''}`} />
          </Button>
        </motion.header>

        {/* Chat area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
          <AnimatePresence mode="wait">
            {!hasMessages ? (
              /* Idle state with avatar */
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-6"
              >
                {/* Animated Avatar */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <AnimatedAvatar 
                    mood={currentMood} 
                    isSpeaking={speaking}
                    size={140}
                  />
                </motion.div>

                {/* Voice Orb */}
                <VoiceOrb
                  state={getOrbState()}
                  onClick={handleOrbClick}
                  size="lg"
                />

                {/* Wake word status */}
                {wakeWordActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-secondary text-sm"
                  >
                    <Radio className="h-4 w-4 animate-pulse" />
                    <span>Listening for "Hey Anjhelika"...</span>
                  </motion.div>
                )}

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

                {/* Text input */}
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
                {ollamaStatus !== 'connected' && (
                  <p className="text-xs text-destructive">
                    Ollama disconnected - Run: ollama serve
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
                {/* Header with small avatar */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <AnimatedAvatar 
                    mood={currentMood} 
                    isSpeaking={speaking}
                    size={64}
                  />
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
