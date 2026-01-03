import { useState, useEffect, useRef, useCallback } from 'react';

const useWakeWord = (wakePhrase = 'hey anjhelika', onWakeWordDetected) => {
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListeningForWakeWord(true);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        
        // Check for wake word variations
        const wakeVariations = [
          wakePhrase,
          'hey angelica',
          'hey angel',
          'a angelica',
          'hey anjelika',
          'okay anjhelika',
          'ok anjhelika'
        ];
        
        const detected = wakeVariations.some(phrase => 
          transcript.includes(phrase) || 
          transcript.endsWith(phrase.split(' ')[1]) // Just the name
        );
        
        if (detected) {
          // Stop wake word detection temporarily
          recognition.stop();
          setIsListeningForWakeWord(false);
          
          // Notify parent
          onWakeWordDetected?.();
          
          // Restart after a delay (let main speech recognition take over)
          timeoutRef.current = setTimeout(() => {
            if (isEnabled && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Already started
              }
            }
          }, 5000);
          
          return;
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.error('Wake word recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      setIsListeningForWakeWord(false);
      
      // Auto-restart if enabled
      if (isEnabled) {
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isEnabled) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Already started
            }
          }
        }, 100);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [wakePhrase, onWakeWordDetected, isEnabled]);

  const startListening = useCallback(() => {
    setIsEnabled(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsEnabled(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsListeningForWakeWord(false);
  }, []);

  const pauseTemporarily = useCallback((duration = 5000) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (isEnabled && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started
        }
      }
    }, duration);
  }, [isEnabled]);

  return {
    isListeningForWakeWord,
    isEnabled,
    startListening,
    stopListening,
    pauseTemporarily
  };
};

export default useWakeWord;
