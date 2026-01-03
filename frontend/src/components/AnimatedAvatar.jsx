import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const moods = {
  neutral: {
    eyePosition: { x: 0, y: 0 },
    mouthPath: "M 35 65 Q 50 70 65 65",
    eyebrowRotate: 0,
    blush: false
  },
  smirk: {
    eyePosition: { x: 2, y: -1 },
    mouthPath: "M 35 62 Q 55 72 65 60",
    eyebrowRotate: -5,
    blush: false
  },
  eyeroll: {
    eyePosition: { x: 0, y: -8 },
    mouthPath: "M 35 65 Q 50 60 65 65",
    eyebrowRotate: 10,
    blush: false
  },
  loving: {
    eyePosition: { x: 0, y: 0 },
    mouthPath: "M 35 60 Q 50 75 65 60",
    eyebrowRotate: -3,
    blush: true
  },
  sassy: {
    eyePosition: { x: 3, y: 0 },
    mouthPath: "M 38 63 Q 52 68 62 60",
    eyebrowRotate: -8,
    blush: false
  },
  thinking: {
    eyePosition: { x: -3, y: -2 },
    mouthPath: "M 40 65 Q 50 63 55 65",
    eyebrowRotate: 5,
    blush: false
  },
  surprised: {
    eyePosition: { x: 0, y: 0 },
    mouthPath: "M 42 62 Q 50 72 58 62",
    eyebrowRotate: -12,
    blush: false
  },
  concerned: {
    eyePosition: { x: 0, y: 2 },
    mouthPath: "M 38 68 Q 50 62 62 68",
    eyebrowRotate: 8,
    blush: false
  },
  flirty: {
    eyePosition: { x: 2, y: 0 },
    mouthPath: "M 35 60 Q 50 72 65 60",
    eyebrowRotate: -6,
    blush: true
  }
};

// Customization presets
const skinTones = {
  light: { base: '#f5d0c5', shadow: '#e8b4a8' },
  medium: '#d4a574',
  olive: '#c4956a',
  tan: '#a67c52',
  brown: '#8b6240',
  dark: '#5c4033'
};

const hairColors = {
  black: { main: '#1a1a2e', highlight: '#2d2d44' },
  brown: { main: '#3d2314', highlight: '#5a3825' },
  blonde: { main: '#c9a227', highlight: '#e0b830' },
  red: { main: '#8b2500', highlight: '#a33000' },
  purple: { main: '#4a1a6b', highlight: '#6b2d8a' },
  blue: { main: '#1a3a5c', highlight: '#2a5080' },
  pink: { main: '#d946ef', highlight: '#e879f9' },
  white: { main: '#e8e8e8', highlight: '#ffffff' }
};

const eyeColors = {
  purple: '#8B5CF6',
  blue: '#3B82F6',
  green: '#10B981',
  brown: '#92400E',
  amber: '#F59E0B',
  red: '#EF4444',
  pink: '#EC4899',
  gray: '#6B7280'
};

const accessoryColors = {
  purple: '#D946EF',
  gold: '#F59E0B',
  silver: '#9CA3AF',
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  pink: '#EC4899',
  none: 'transparent'
};

const AnimatedAvatar = ({ 
  mood = 'neutral', 
  isSpeaking = false, 
  size = 128,
  customization = {}
}) => {
  const currentMood = moods[mood] || moods.neutral;
  
  // Get customization values with defaults
  const skinTone = skinTones[customization.skin || 'light'];
  const skin = typeof skinTone === 'object' ? skinTone : { base: skinTone, shadow: skinTone };
  const hair = hairColors[customization.hair || 'black'];
  const eyes = eyeColors[customization.eyes || 'purple'];
  const accessory = accessoryColors[customization.accessory || 'purple'];
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isSpeaking 
            ? ['0 0 20px rgba(217, 70, 239, 0.4)', '0 0 40px rgba(217, 70, 239, 0.6)', '0 0 20px rgba(217, 70, 239, 0.4)']
            : '0 0 20px rgba(217, 70, 239, 0.3)'
        }}
        transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
      />
      
      {/* Avatar container */}
      <motion.div
        className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/30"
        animate={{ scale: isSpeaking ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-fuchsia-900 to-purple-900" />
        
        {/* SVG Face */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {/* Hair back */}
          <ellipse cx="50" cy="35" rx="38" ry="30" fill={hair.main} />
          <path d="M 15 45 Q 10 30 20 15 Q 50 5 80 15 Q 90 30 85 45" fill={hair.main} />
          
          {/* Face */}
          <ellipse cx="50" cy="50" rx="30" ry="32" fill={skin.base} />
          
          {/* Face shadow */}
          <ellipse cx="50" cy="55" rx="28" ry="28" fill={skin.shadow} opacity="0.3" />
          
          {/* Blush */}
          <AnimatePresence>
            {currentMood.blush && (
              <>
                <motion.ellipse
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  cx="28" cy="55" rx="8" ry="4"
                  fill="#ff9999"
                />
                <motion.ellipse
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  cx="72" cy="55" rx="8" ry="4"
                  fill="#ff9999"
                />
              </>
            )}
          </AnimatePresence>
          
          {/* Left eyebrow */}
          <motion.path
            d="M 28 38 Q 35 35 42 38"
            stroke={hair.main}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{ rotate: currentMood.eyebrowRotate }}
            style={{ transformOrigin: '35px 37px' }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Right eyebrow */}
          <motion.path
            d="M 58 38 Q 65 35 72 38"
            stroke={hair.main}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{ rotate: -currentMood.eyebrowRotate }}
            style={{ transformOrigin: '65px 37px' }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Left eye white */}
          <ellipse cx="35" cy="48" rx="8" ry="6" fill="white" />
          
          {/* Right eye white */}
          <ellipse cx="65" cy="48" rx="8" ry="6" fill="white" />
          
          {/* Left pupil */}
          <motion.g
            animate={{ 
              x: currentMood.eyePosition.x, 
              y: currentMood.eyePosition.y 
            }}
            transition={{ duration: 0.3 }}
          >
            <circle cx="35" cy="48" r="4" fill={eyes} />
            <circle cx="36" cy="47" r="1.5" fill="white" />
          </motion.g>
          
          {/* Right pupil */}
          <motion.g
            animate={{ 
              x: currentMood.eyePosition.x, 
              y: currentMood.eyePosition.y 
            }}
            transition={{ duration: 0.3 }}
          >
            <circle cx="65" cy="48" r="4" fill={eyes} />
            <circle cx="66" cy="47" r="1.5" fill="white" />
          </motion.g>
          
          {/* Eyelashes */}
          <path d="M 27 44 L 25 41" stroke={hair.main} strokeWidth="1" />
          <path d="M 30 43 L 29 40" stroke={hair.main} strokeWidth="1" />
          <path d="M 70 43 L 71 40" stroke={hair.main} strokeWidth="1" />
          <path d="M 73 44 L 75 41" stroke={hair.main} strokeWidth="1" />
          
          {/* Nose */}
          <path d="M 50 52 L 48 58 Q 50 60 52 58 L 50 52" fill={skin.shadow} />
          
          {/* Mouth */}
          <motion.path
            d={currentMood.mouthPath}
            stroke="#c44569"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            initial={false}
            animate={{ d: currentMood.mouthPath }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Speaking animation - mouth opening */}
          {isSpeaking && (
            <motion.ellipse
              cx="50"
              cy="66"
              fill="#8B2252"
              animate={{ 
                rx: [6, 8, 5, 7, 6],
                ry: [3, 5, 2, 4, 3]
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          )}
          
          {/* Earrings */}
          {accessory !== 'transparent' && (
            <>
              <circle cx="18" cy="55" r="3" fill={accessory} />
              <circle cx="82" cy="55" r="3" fill={accessory} />
            </>
          )}
          
          {/* Hair strands/bangs */}
          <path d="M 25 25 Q 20 35 25 45" stroke={hair.highlight} strokeWidth="3" fill="none" />
          <path d="M 75 25 Q 80 35 75 45" stroke={hair.highlight} strokeWidth="3" fill="none" />
          <path d="M 35 18 Q 33 28 38 35" stroke={hair.highlight} strokeWidth="2" fill="none" />
          <path d="M 65 18 Q 67 28 62 35" stroke={hair.highlight} strokeWidth="2" fill="none" />
        </svg>
        
        {/* Neon highlight overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
      </motion.div>
      
      {/* Mood indicator */}
      <motion.div
        key={mood}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-mono bg-card border border-border"
      >
        {mood}
      </motion.div>
    </div>
  );
};

// Export customization options for settings
export const avatarOptions = {
  skinTones: Object.keys(skinTones),
  hairColors: Object.keys(hairColors),
  eyeColors: Object.keys(eyeColors),
  accessoryColors: Object.keys(accessoryColors)
};

export default AnimatedAvatar;
