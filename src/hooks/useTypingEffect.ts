// src/hooks/useTypingEffect.ts
import { useState, useEffect } from 'react';

export function useTypingEffect(text: string, speed = 40) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIdx = 0;
    setDisplayedText('');
    setIsComplete(false);

    if (!text) return;

    const interval = setInterval(() => {
      if (currentIdx < text.length) {
        setDisplayedText((prev) => prev + text.charAt(currentIdx));
        currentIdx++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isComplete };
}
