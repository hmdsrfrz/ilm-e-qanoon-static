// src/features/welcome/BootSequence.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { config } from '@/store/configStore';
import { cn } from '@/lib/cn';

const BOOT_LINES = [
  `> INITIALIZING SECY v${config.app.version} ████████████ OK`,
  '> GMAIL TOOL ........... CONNECTED',
  '> CALENDAR TOOL ........ CONNECTED',
  '> RAG ENGINE ........... LOADED',
  '> READY _',
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  
  // Check session storage outside of hook if possible, or use a local state initialized from it
  const [isVisible, setIsVisible] = useState(() => {
    const hasSeen = typeof window !== 'undefined' ? sessionStorage.getItem('secy_boot_seen') : null;
    return !(hasSeen || !config.features.bootSequence);
  });

  useEffect(() => {
    if (!isVisible) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev < BOOT_LINES.length) return prev + 1;
        clearInterval(interval);
        
        // Final fade out after 1s
        setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('secy_boot_seen', 'true');
          setTimeout(onComplete, 400); // Allow exit animation to complete
        }, 1000);
        
        return prev;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-pk-black flex items-center justify-center p-8 font-mono"
    >
      <div className="w-full max-w-2xl space-y-2">
        {BOOT_LINES.slice(0, visibleLines).map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "text-xs md:text-sm",
              line.includes('CONNECTED') || line.includes('LOADED') || line.includes('READY') || line.includes('OK')
                ? "text-pk-green"
                : "text-pk-muted"
            )}
          >
            {line}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
