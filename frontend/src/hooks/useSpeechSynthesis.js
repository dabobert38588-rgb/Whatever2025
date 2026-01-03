import { useState, useEffect, useCallback, useRef } from 'react';

const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const synth = window.speechSynthesis;

    if (!synth) {
      setBrowserSupported(false);
      return;
    }

    setBrowserSupported(true);

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      
      // Try to find a female English voice
      const femaleVoiceIndex = availableVoices.findIndex(
        v => v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('samantha') ||
         v.name.toLowerCase().includes('victoria') ||
         v.name.toLowerCase().includes('karen') ||
         v.name.toLowerCase().includes('moira'))
      );
      
      if (femaleVoiceIndex !== -1) {
        setSelectedVoiceIndex(femaleVoiceIndex);
      } else {
        // Just pick first English voice
        const englishIndex = availableVoices.findIndex(v => v.lang.startsWith('en'));
        if (englishIndex !== -1) {
          setSelectedVoiceIndex(englishIndex);
        }
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.cancel();
    };
  }, []);

  const speak = useCallback((text, options = {}) => {
    const synth = window.speechSynthesis;
    
    if (!synth || !browserSupported || !text) {
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Set voice
    const voiceIndex = options.voiceIndex !== undefined ? options.voiceIndex : selectedVoiceIndex;
    if (voices[voiceIndex]) {
      utterance.voice = voices[voiceIndex];
    }

    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setSpeaking(false);
    };

    synth.speak(utterance);
  }, [browserSupported, voices, selectedVoiceIndex]);

  const stop = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      setSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    speaking,
    browserSupported,
    voices,
    selectedVoiceIndex,
    setSelectedVoiceIndex,
  };
};

export default useSpeechSynthesis;
