import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const SettingsPanel = ({
  isOpen,
  onClose,
  voices,
  selectedVoiceIndex,
  onVoiceChange,
  speechRate,
  onSpeechRateChange,
  speechPitch,
  onSpeechPitchChange,
  ollamaStatus,
  ollamaModel
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            data-testid="settings-backdrop"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md glass z-50 overflow-y-auto"
            data-testid="settings-panel"
          >
            <div className="p-6 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 
                  className="text-2xl font-bold text-gradient-primary"
                  style={{ fontFamily: 'Unbounded, sans-serif' }}
                >
                  Neural Config
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                  data-testid="close-settings"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Ollama Status */}
              <div className="space-y-3 p-4 rounded-lg bg-card border border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  AI Core Status
                </h3>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${ollamaStatus === 'connected' ? 'bg-secondary neon-secondary' : 'bg-destructive'}`} />
                  <span className="text-sm">
                    Ollama: <span className={ollamaStatus === 'connected' ? 'text-secondary' : 'text-destructive'}>
                      {ollamaStatus === 'connected' ? 'Online' : 'Offline'}
                    </span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Model: {ollamaModel || 'qwen3'}
                </div>
              </div>

              {/* Voice Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Voice Synthesis
                </h3>

                {/* Voice Selection */}
                <div className="space-y-2">
                  <Label htmlFor="voice-select" className="text-sm">Voice</Label>
                  <Select
                    value={selectedVoiceIndex.toString()}
                    onValueChange={(value) => onVoiceChange(parseInt(value))}
                  >
                    <SelectTrigger id="voice-select" className="w-full" data-testid="voice-select">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speech Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Speech Rate</Label>
                    <span className="text-xs text-muted-foreground font-mono">{speechRate.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[speechRate]}
                    onValueChange={([value]) => onSpeechRateChange(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                    data-testid="speech-rate-slider"
                  />
                </div>

                {/* Speech Pitch */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Pitch</Label>
                    <span className="text-xs text-muted-foreground font-mono">{speechPitch.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[speechPitch]}
                    onValueChange={([value]) => onSpeechPitchChange(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                    data-testid="speech-pitch-slider"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="text-xs text-muted-foreground p-4 rounded-lg bg-card border border-border">
                <p className="mb-2 font-semibold text-foreground">Quick Tips:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Tap the mic to speak your message</li>
                  <li>Anjhelika will auto-respond with voice</li>
                  <li>Mute to disable auto-voice responses</li>
                  <li>Make sure Ollama is running locally</li>
                </ul>
              </div>

              {/* Personality Note */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-sm italic text-muted-foreground">
                  "I'm Anjhelika - your sarcastic, dark-humored AI companion. Don't expect me to sugarcoat things, darling. That's not my style."
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
