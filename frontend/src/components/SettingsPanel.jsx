import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Sparkles, Palette, Save, Trash2, Plus, Flame, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import AnimatedAvatar, { avatarOptions } from './AnimatedAvatar';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  sarcasmLevel,
  onSarcasmChange,
  sweetnessLevel,
  onSweetnessChange,
  avatarCustomization,
  onAvatarCustomizationChange,
  adultMode,
  onAdultModeChange
}) => {
  const [personalityPresets, setPersonalityPresets] = useState({ default: [], custom: [] });
  const [avatarPresets, setAvatarPresets] = useState([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [newAvatarPresetName, setNewAvatarPresetName] = useState('');
  const [showSavePersonality, setShowSavePersonality] = useState(false);
  const [showSaveAvatar, setShowSaveAvatar] = useState(false);
  const [showAdultConfirm, setShowAdultConfirm] = useState(false);

  // Fetch presets on open
  useEffect(() => {
    if (isOpen) {
      fetchPersonalityPresets();
      fetchAvatarPresets();
    }
  }, [isOpen]);

  const fetchPersonalityPresets = async () => {
    try {
      const response = await axios.get(`${API}/presets/personality`);
      setPersonalityPresets(response.data);
    } catch (err) {
      console.error('Failed to fetch personality presets:', err);
    }
  };

  const fetchAvatarPresets = async () => {
    try {
      const response = await axios.get(`${API}/presets/avatar`);
      setAvatarPresets(response.data.presets || []);
    } catch (err) {
      console.error('Failed to fetch avatar presets:', err);
    }
  };

  const applyPersonalityPreset = (preset) => {
    onSarcasmChange(preset.sarcasm);
    onSweetnessChange(preset.sweetness);
    toast.success(`Applied "${preset.name}" preset`);
  };

  const savePersonalityPreset = async () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    try {
      await axios.post(`${API}/presets/personality`, {
        name: newPresetName,
        sarcasm: sarcasmLevel,
        sweetness: sweetnessLevel,
        icon: '✨'
      });
      toast.success('Personality preset saved!');
      setNewPresetName('');
      setShowSavePersonality(false);
      fetchPersonalityPresets();
    } catch (err) {
      toast.error('Failed to save preset');
    }
  };

  const deletePersonalityPreset = async (presetId) => {
    try {
      await axios.delete(`${API}/presets/personality/${presetId}`);
      toast.success('Preset deleted');
      fetchPersonalityPresets();
    } catch (err) {
      toast.error('Failed to delete preset');
    }
  };

  const applyAvatarPreset = (preset) => {
    onAvatarCustomizationChange(preset.customization);
    toast.success(`Applied "${preset.name}" look`);
  };

  const saveAvatarPreset = async () => {
    if (!newAvatarPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    try {
      await axios.post(`${API}/presets/avatar`, {
        name: newAvatarPresetName,
        customization: avatarCustomization
      });
      toast.success('Avatar preset saved!');
      setNewAvatarPresetName('');
      setShowSaveAvatar(false);
      fetchAvatarPresets();
    } catch (err) {
      toast.error('Failed to save preset');
    }
  };

  const deleteAvatarPreset = async (presetId) => {
    try {
      await axios.delete(`${API}/presets/avatar/${presetId}`);
      toast.success('Avatar preset deleted');
      fetchAvatarPresets();
    } catch (err) {
      toast.error('Failed to delete preset');
    }
  };

  const handleAdultModeToggle = () => {
    if (!adultMode) {
      setShowAdultConfirm(true);
    } else {
      onAdultModeChange(false);
      toast.info('Adult mode disabled');
    }
  };

  const confirmAdultMode = () => {
    onAdultModeChange(true);
    setShowAdultConfirm(false);
    toast.success('Adult mode enabled 🔥');
  };

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
            className="fixed right-0 top-0 h-full w-full max-w-md glass z-50 overflow-hidden flex flex-col"
            data-testid="settings-panel"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
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

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* AI Status */}
                <div className="space-y-3 p-4 rounded-lg bg-card border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    AI Core Status
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${ollamaStatus === 'connected' ? 'bg-secondary neon-secondary' : 'bg-destructive'}`} />
                    <span className="text-sm">
                      OpenAI: <span className={ollamaStatus === 'connected' ? 'text-secondary' : 'text-destructive'}>
                        {ollamaStatus === 'connected' ? 'Online' : 'Offline'}
                      </span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Model: {ollamaModel || 'gpt-5.2'}
                  </div>
                </div>

                {/* Tabs */}
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
                    {/* Adult Mode Toggle */}
                    <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Flame className={`h-5 w-5 ${adultMode ? 'text-destructive' : 'text-muted-foreground'}`} />
                          <div>
                            <Label className="text-sm font-semibold">Adult Mode</Label>
                            <p className="text-xs text-muted-foreground">Enable explicit content</p>
                          </div>
                        </div>
                        <Switch
                          checked={adultMode}
                          onCheckedChange={handleAdultModeToggle}
                          data-testid="adult-mode-toggle"
                        />
                      </div>
                      {adultMode && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          NSFW content enabled - Anjhelika is feeling spicy
                        </p>
                      )}
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Quick Presets
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {personalityPresets.default?.map((preset) => (
                          <Button
                            key={preset.id}
                            variant="outline"
                            size="sm"
                            onClick={() => applyPersonalityPreset(preset)}
                            className="justify-start gap-2 h-auto py-2"
                            data-testid={`preset-${preset.id}`}
                          >
                            <span className="text-lg">{preset.icon}</span>
                            <span className="text-xs">{preset.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Presets */}
                    {personalityPresets.custom?.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Your Presets
                        </h3>
                        <div className="space-y-2">
                          {personalityPresets.custom.map((preset) => (
                            <div key={preset.id} className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyPersonalityPreset(preset)}
                                className="flex-1 justify-start gap-2"
                              >
                                <span>{preset.icon}</span>
                                <span className="text-xs">{preset.name}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {preset.sarcasm}% / {preset.sweetness}%
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deletePersonalityPreset(preset.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sliders */}
                    <div className="space-y-4 pt-4 border-t border-border">
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
                        <span>Gentle</span>
                        <span>Maximum sass</span>
                      </div>
                    </div>

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

                    {/* Current Vibe */}
                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <p className="text-xs font-semibold text-primary mb-2">Current Vibe:</p>
                      <p className="text-sm text-muted-foreground">
                        {sarcasmLevel >= 70 && sweetnessLevel >= 70 && "Sassy but loving - tough love expert"}
                        {sarcasmLevel >= 70 && sweetnessLevel < 70 && "Sharp-tongued and independent"}
                        {sarcasmLevel < 70 && sweetnessLevel >= 70 && "Playfully teasing sweetheart"}
                        {sarcasmLevel < 70 && sweetnessLevel < 70 && "Chill and straightforward"}
                      </p>
                    </div>

                    {/* Save Custom Preset */}
                    <Dialog open={showSavePersonality} onOpenChange={setShowSavePersonality}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full gap-2">
                          <Save className="h-4 w-4" />
                          Save Current as Preset
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save Personality Preset</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Preset Name</Label>
                            <Input
                              value={newPresetName}
                              onChange={(e) => setNewPresetName(e.target.value)}
                              placeholder="e.g., My Perfect Mix"
                            />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sarcasm: {sarcasmLevel}% • Sweetness: {sweetnessLevel}%
                          </div>
                          <Button onClick={savePersonalityPreset} className="w-full">
                            Save Preset
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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

                    {/* Saved Looks */}
                    {avatarPresets.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Saved Looks
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {avatarPresets.map((preset) => (
                            <div key={preset.id} className="relative group">
                              <button
                                onClick={() => applyAvatarPreset(preset)}
                                className="w-full p-2 rounded-lg border border-border hover:border-primary transition-colors"
                              >
                                <AnimatedAvatar 
                                  mood="neutral" 
                                  size={50}
                                  customization={preset.customization}
                                />
                                <p className="text-xs mt-1 truncate">{preset.name}</p>
                              </button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteAvatarPreset(preset.id)}
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customization Options */}
                    <div className="space-y-4">
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
                    </div>

                    {/* Save Avatar Preset */}
                    <Dialog open={showSaveAvatar} onOpenChange={setShowSaveAvatar}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full gap-2">
                          <Save className="h-4 w-4" />
                          Save Current Look
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save Avatar Look</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="flex justify-center">
                            <AnimatedAvatar 
                              mood="loving" 
                              size={80}
                              customization={avatarCustomization}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Look Name</Label>
                            <Input
                              value={newAvatarPresetName}
                              onChange={(e) => setNewAvatarPresetName(e.target.value)}
                              placeholder="e.g., Cyber Princess"
                            />
                          </div>
                          <Button onClick={saveAvatarPreset} className="w-full">
                            Save Look
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>

                  {/* Voice Tab */}
                  <TabsContent value="voice" className="space-y-6 mt-4">
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
                    <li>Tap presets to quickly change personality</li>
                    <li>Save your favorite combos for later</li>
                    <li>Avatar changes are instant</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>

            {/* Adult Mode Confirmation Dialog */}
            <AlertDialog open={showAdultConfirm} onOpenChange={setShowAdultConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-destructive" />
                    Enable Adult Mode?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>This will enable explicit and NSFW content in conversations with Anjhelika.</p>
                    <p className="font-semibold">By enabling this, you confirm that:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>You are 18 years or older</li>
                      <li>This is for personal use only</li>
                      <li>You accept responsibility for the content</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={confirmAdultMode}
                    className="bg-destructive hover:bg-destructive/90"
                    data-testid="confirm-adult-mode"
                  >
                    I'm 18+, Enable
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
