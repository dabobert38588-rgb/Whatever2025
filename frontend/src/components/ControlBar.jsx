import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const ControlBar = ({
  isListening,
  isSpeaking,
  isMuted,
  onMicClick,
  onMuteToggle,
  onSettingsClick,
  onClearChat,
  disabled
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="glass rounded-full px-6 py-3 flex items-center gap-4">
        <TooltipProvider delayDuration={300}>
          {/* Mic button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isListening ? 'destructive' : 'default'}
                size="lg"
                onClick={onMicClick}
                disabled={disabled || isSpeaking}
                className={`rounded-full h-14 w-14 ${isListening ? 'neon-primary animate-pulse' : ''}`}
                data-testid="mic-button"
              >
                {isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isListening ? 'Stop listening' : 'Start speaking'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Mute/unmute TTS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMuteToggle}
                className={`rounded-full h-10 w-10 ${isMuted ? 'text-destructive' : 'text-foreground'}`}
                data-testid="mute-button"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className={`h-5 w-5 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isMuted ? 'Unmute voice' : 'Mute voice'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Clear chat */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearChat}
                className="rounded-full h-10 w-10 text-muted-foreground hover:text-destructive"
                data-testid="clear-chat-button"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Clear conversation</p>
            </TooltipContent>
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettingsClick}
                className="rounded-full h-10 w-10 text-muted-foreground hover:text-secondary"
                data-testid="settings-button"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Neural Config</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
};

export default ControlBar;
