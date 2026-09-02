import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotate?: number;
  /** Parallax intensity multiplier for the translate effect. */
  speed?: number;
}

export const ParallaxCard: React.FC<ParallaxCardProps> = ({
  children,
  className = '',
  maxRotate = 8
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rX = -((mouseY / height) * maxRotate - maxRotate / 2);
    const rY = (mouseX / width) * maxRotate - maxRotate / 2;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};
