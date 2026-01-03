import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Sparkles, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import AnimatedAvatar, { avatarOptions } from './AnimatedAvatar';

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
  ollamaModel,
  // Personality settings
  sarcasmLevel,
  onSarcasmChange,
  sweetnessLevel,
  onSweetnessChange,
  // Avatar customization
  avatarCustomization,
  onAvatarCustomizationChange
}) => {
  const handleAvatarChange = (key, value) => {
    onAvatarCustomizationChange({
      ...avatarCustomization,
      [key]: value
    });
  };

  const colorDisplayName = (color) => {
    return color.charAt(0).toUpperCase() + color.slice(1);
  };

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
            <div className="p-6 space-y-6">
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
                  Model: {ollamaModel || 'qwen3:1.7b'}
                </div>
              </div>

              {/* Tabs for different settings */}
              <Tabs defaultValue="personality" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personality" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Personality
                  </TabsTrigger>
                  <TabsTrigger value="avatar" className="gap-1">
                    <Palette className="h-3 w-3" />
                    Avatar
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="gap-1">
                    <Volume2 className="h-3 w-3" />
                    Voice
                  </TabsTrigger>
                </TabsList>

                {/* Personality Tab */}
                <TabsContent value="personality" className="space-y-6 mt-4">
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground italic">
                      "Fine-tune my attitude. I'll try not to take it personally."
                    </p>
                  </div>

                  {/* Sarcasm Level */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm flex items-center gap-2">
                        😏 Sarcasm Level
                      </Label>
                      <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-muted rounded">
                        {sarcasmLevel}%
                      </span>
                    </div>
                    <Slider
                      value={[sarcasmLevel]}
                      onValueChange={([value]) => onSarcasmChange(value)}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                      data-testid="sarcasm-slider"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Gentle teasing</span>
                      <span>Maximum sass</span>
                    </div>
                  </div>

                  {/* Sweetness Level */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm flex items-center gap-2">
                        💕 Sweetness Level
                      </Label>
                      <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-muted rounded">
                        {sweetnessLevel}%
                      </span>
                    </div>
                    <Slider
                      value={[sweetnessLevel]}
                      onValueChange={([value]) => onSweetnessChange(value)}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                      data-testid="sweetness-slider"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Independent</span>
                      <span>Super affectionate</span>
                    </div>
                  </div>

                  {/* Personality preview */}
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <p className="text-xs font-semibold text-primary mb-2">Current Vibe:</p>
                    <p className="text-sm text-muted-foreground">
                      {sarcasmLevel >= 70 && sweetnessLevel >= 70 && "Sassy but loving - tough love expert"}
                      {sarcasmLevel >= 70 && sweetnessLevel < 70 && "Sharp-tongued and independent"}
                      {sarcasmLevel < 70 && sweetnessLevel >= 70 && "Playfully teasing sweetheart"}
                      {sarcasmLevel < 70 && sweetnessLevel < 70 && "Chill and straightforward"}
                    </p>
                  </div>
                </TabsContent>

                {/* Avatar Tab */}
                <TabsContent value="avatar" className="space-y-6 mt-4">
                  {/* Preview */}
                  <div className="flex justify-center py-4">
                    <AnimatedAvatar 
                      mood="smirk" 
                      size={100}
                      customization={avatarCustomization}
                    />
                  </div>

                  {/* Skin Tone */}
                  <div className="space-y-2">
                    <Label className="text-sm">Skin Tone</Label>
                    <Select
                      value={avatarCustomization.skin || 'light'}
                      onValueChange={(value) => handleAvatarChange('skin', value)}
                    >
                      <SelectTrigger data-testid="skin-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {avatarOptions.skinTones.map((tone) => (
                          <SelectItem key={tone} value={tone}>
                            {colorDisplayName(tone)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hair Color */}
                  <div className="space-y-2">
                    <Label className="text-sm">Hair Color</Label>
                    <Select
                      value={avatarCustomization.hair || 'black'}
                      onValueChange={(value) => handleAvatarChange('hair', value)}
                    >
                      <SelectTrigger data-testid="hair-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {avatarOptions.hairColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {colorDisplayName(color)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Eye Color */}
                  <div className="space-y-2">
                    <Label className="text-sm">Eye Color</Label>
                    <Select
                      value={avatarCustomization.eyes || 'purple'}
                      onValueChange={(value) => handleAvatarChange('eyes', value)}
                    >
                      <SelectTrigger data-testid="eyes-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {avatarOptions.eyeColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {colorDisplayName(color)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Accessory Color */}
                  <div className="space-y-2">
                    <Label className="text-sm">Earring Color</Label>
                    <Select
                      value={avatarCustomization.accessory || 'purple'}
                      onValueChange={(value) => handleAvatarChange('accessory', value)}
                    >
                      <SelectTrigger data-testid="accessory-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {avatarOptions.accessoryColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {colorDisplayName(color)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Voice Tab */}
                <TabsContent value="voice" className="space-y-6 mt-4">
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
                </TabsContent>
              </Tabs>

              {/* Tips */}
              <div className="text-xs text-muted-foreground p-4 rounded-lg bg-card border border-border">
                <p className="mb-2 font-semibold text-foreground">Quick Tips:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Tap the mic or say "Hey Anjhelika" to speak</li>
                  <li>Personality changes apply to new messages</li>
                  <li>Avatar changes are instant</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
