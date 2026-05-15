// src/hooks/useVoiceInput.ts
import { useState, useCallback } from 'react';

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript] = useState('');

  const startListening = useCallback(() => {
    console.log('Voice input: Start listening (placeholder)');
    setIsListening(true);
    // Placeholder implementation for Web Speech API
  }, []);

  const stopListening = useCallback(() => {
    console.log('Voice input: Stop listening (placeholder)');
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
}
