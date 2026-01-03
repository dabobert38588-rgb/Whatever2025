import React from 'react';
import { motion } from 'framer-motion';

const VoiceOrb = ({ state = 'idle', onClick, size = 'lg' }) => {
  // state: 'idle' | 'listening' | 'thinking' | 'speaking'
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const getStateStyles = () => {
    switch (state) {
      case 'listening':
        return {
          bg: 'bg-gradient-to-br from-fuchsia-500 to-violet-600',
          shadow: '0 0 40px rgba(217, 70, 239, 0.5)',
          animation: 'animate-pulse-ring'
        };
      case 'thinking':
        return {
          bg: 'bg-gradient-to-br from-lime-400 to-green-500',
          shadow: '0 0 40px rgba(163, 230, 53, 0.5)',
          animation: 'animate-spin-slow'
        };
      case 'speaking':
        return {
          bg: 'bg-gradient-to-br from-fuchsia-500 to-pink-500',
          shadow: '0 0 50px rgba(217, 70, 239, 0.6)',
          animation: ''
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-violet-600 to-fuchsia-600',
          shadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          animation: ''
        };
    }
  };

  const styles = getStateStyles();

  return (
    <motion.button
      data-testid="voice-orb"
      onClick={onClick}
      className={`relative ${sizeClasses[size]} rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outer glow rings */}
      <motion.div
        className={`absolute inset-0 rounded-full ${styles.bg} opacity-20 blur-xl`}
        animate={state === 'listening' ? {
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.1, 0.2]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <motion.div
        className={`absolute inset-2 rounded-full ${styles.bg} opacity-30 blur-lg`}
        animate={state === 'listening' ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.15, 0.3]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
      />

      {/* Main orb */}
      <motion.div
        className={`absolute inset-4 rounded-full ${styles.bg} ${styles.animation}`}
        style={{ boxShadow: styles.shadow }}
        animate={state === 'thinking' ? { rotate: 360 } : {}}
        transition={state === 'thinking' ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
      >
        {/* Inner highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
        
        {/* Speaking waveform */}
        {state === 'speaking' && (
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white/80 rounded-full"
                animate={{
                  height: ['20%', '80%', '20%']
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        )}

        {/* Thinking dots */}
        {state === 'thinking' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="flex gap-1"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </div>
        )}

        {/* Idle/Listening icon */}
        {(state === 'idle' || state === 'listening') && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              animate={state === 'listening' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </motion.svg>
          </div>
        )}
      </motion.div>

      {/* Status text */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {state === 'listening' && 'Listening...'}
          {state === 'thinking' && 'Thinking...'}
          {state === 'speaking' && 'Speaking...'}
          {state === 'idle' && 'Tap to speak'}
        </span>
      </div>
    </motion.button>
  );
};

export default VoiceOrb;
