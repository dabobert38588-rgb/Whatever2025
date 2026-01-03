import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Button } from './ui/button';

const ChatMessage = ({ message, onSpeak, isSpeaking }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      data-testid={`message-${message.id}`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Sender name */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="text-sm font-bold text-gradient-primary"
              style={{ fontFamily: 'Unbounded, sans-serif' }}
            >
              Anjhelika
            </span>
          </div>
        )}
        
        <div className={`relative group ${isUser ? 'message-user' : 'message-ai'} px-4 py-3`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* Speak button for AI messages */}
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeak?.(message.content)}
              className={`absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full ${isSpeaking ? 'opacity-100 text-primary' : ''}`}
              data-testid={`speak-message-${message.id}`}
            >
              <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </Button>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <span className="text-xs text-muted-foreground font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
