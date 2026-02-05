import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Download, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const moodOptions = [
  { value: 'smirk', label: '😏 Smirk', desc: 'Confident & knowing' },
  { value: 'loving', label: '🥰 Loving', desc: 'Warm & affectionate' },
  { value: 'sassy', label: '💅 Sassy', desc: 'Bold & fierce' },
  { value: 'flirty', label: '😘 Flirty', desc: 'Playful & seductive' },
  { value: 'thinking', label: '🤔 Thinking', desc: 'Contemplative' },
  { value: 'surprised', label: '😲 Surprised', desc: 'Wide-eyed wonder' },
];

const contextOptions = [
  { value: 'casual selfie at home', label: 'At Home' },
  { value: 'coffee shop with neon lights', label: 'Coffee Shop' },
  { value: 'night city rooftop with skyline', label: 'Rooftop' },
  { value: 'cozy bedroom with fairy lights', label: 'Bedroom' },
  { value: 'rainy window with city lights', label: 'Rainy Day' },
  { value: 'beach sunset', label: 'Beach' },
  { value: 'gaming setup with RGB lights', label: 'Gaming Room' },
];

const SelfieGenerator = ({ isOpen, onClose, avatarCustomization }) => {
  const [mood, setMood] = useState('smirk');
  const [context, setContext] = useState('casual selfie at home');
  const [customContext, setCustomContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const generateSelfie = async () => {
    setGenerating(true);
    setGeneratedImage(null);
    
    try {
      const response = await axios.post(`${API}/generate-selfie`, {
        mood,
        context: customContext || context,
        avatar_style: avatarCustomization
      });
      
      setGeneratedImage(response.data.image_base64);
      toast.success('Selfie generated! 📸');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate selfie');
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImage}`;
    link.download = `anjhelika-${mood}-${Date.now()}.png`;
    link.click();
    toast.success('Downloaded! 💾');
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
          />
          
          {/* Panel */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg glass z-50 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            data-testid="selfie-generator"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h2 
                  className="text-xl font-bold text-gradient-primary"
                  style={{ fontFamily: 'Unbounded, sans-serif' }}
                >
                  Request Selfie
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Generated Image Display */}
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-xl overflow-hidden border border-primary/30"
                >
                  <img
                    src={`data:image/png;base64,${generatedImage}`}
                    alt="Anjhelika selfie"
                    className="w-full h-auto"
                  />
                  <Button
                    onClick={downloadImage}
                    size="sm"
                    className="absolute bottom-2 right-2 gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Save
                  </Button>
                </motion.div>
              )}
              
              {/* Generating State */}
              {generating && (
                <div className="py-12 text-center">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">
                    Anjhelika is taking a selfie...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This may take up to a minute
                  </p>
                </div>
              )}
              
              {/* Options */}
              {!generating && (
                <>
                  {/* Mood Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm">Mood / Expression</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger data-testid="mood-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {moodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span>{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.desc}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Context/Setting Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm">Setting</Label>
                    <Select value={context} onValueChange={setContext}>
                      <SelectTrigger data-testid="context-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contextOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Custom Context */}
                  <div className="space-y-2">
                    <Label className="text-sm">Or describe a custom setting</Label>
                    <Input
                      value={customContext}
                      onChange={(e) => setCustomContext(e.target.value)}
                      placeholder="e.g., cozy library with candlelight"
                      className="bg-card"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                    <p className="text-muted-foreground">
                      <Sparkles className="h-4 w-4 inline mr-1 text-primary" />
                      Selfie will match your avatar customization settings (hair, eyes, etc.)
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Footer */}
            {!generating && (
              <div className="p-4 border-t border-border shrink-0">
                <Button
                  onClick={generateSelfie}
                  className="w-full gap-2 neon-primary"
                  disabled={generating}
                  data-testid="generate-selfie-btn"
                >
                  <Camera className="h-4 w-4" />
                  {generatedImage ? 'Generate Another' : 'Generate Selfie'}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SelfieGenerator;
