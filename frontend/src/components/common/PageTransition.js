import React from 'react';
import { motion } from 'framer-motion';

// Predefined animation variants
const variants = {
  // Fade in from bottom (default)
  fadeUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  },
  
  // Fade in from left
  fadeLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  },
  
  // Fade in from right
  fadeRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  },
  
  // Scale up with fade
  scaleUp: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  },
  
  // Zoom in
  zoomIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  },
  
  // Slide up with fade (more dramatic)
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  },
  
  // Rotate in
  rotateIn: {
    initial: { opacity: 0, rotate: -5, scale: 0.95 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 5, scale: 0.95 },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  },
  
  // Staggered children (for lists)
  staggerContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  },
  
  // Staggered item
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  }
};

const PageTransition = ({ 
  children, 
  type = 'fadeUp', // 'fadeUp', 'fadeLeft', 'fadeRight', 'scaleUp', 'zoomIn', 'slideUp', 'rotateIn'
  duration = 0.4,
  delay = 0,
  customStyle = {},
  ...props 
}) => {
  // Get the selected variant or use custom
  const selectedVariant = variants[type] || variants.fadeUp;
  
  // Custom transition overrides
  const customTransition = {
    duration,
    delay,
    ease: [0.25, 0.1, 0.25, 1],
    ...props.transition
  };
  
  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={customTransition}
      style={customStyle}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Component for staggered list items
export const StaggerContainer = ({ children, ...props }) => {
  return (
    <motion.div
      variants={variants.staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Component for staggered list item
export const StaggerItem = ({ children, ...props }) => {
  return (
    <motion.div
      variants={variants.staggerItem}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Component for card hover animation
export const CardHover = ({ children, ...props }) => {
  return (
    <motion.div
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Component for button tap animation
export const ButtonTap = ({ children, ...props }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Component for fade in on scroll
export const FadeInOnScroll = ({ children, threshold = 0.1, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;