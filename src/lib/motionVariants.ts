// src/lib/motionVariants.ts
import type { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
};

export const staggerContainer: Variants = {
  animate: { 
    transition: { staggerChildren: 0.08 } 
  }
};

export const sidebarVariants: Variants = {
  open: { 
    x: 0, 
    transition: { type: 'spring', stiffness: 300, damping: 30 } 
  },
  closed: { 
    x: '-100%', 
    transition: { type: 'spring', stiffness: 300, damping: 30 } 
  },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -6,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};
