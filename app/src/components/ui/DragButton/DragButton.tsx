// src/components/ui/DragButton/DragButton.tsx
import { Box } from '@radix-ui/themes';
import clsx from 'clsx';
import { PanInfo, motion, useMotionValue } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import DragHandle from '../DragHandle/DragHandle';
import { animatedBG, sDragBg, sDragButton, sInvisible } from './DragButton.css';

type DragButtonProps = {
  initialPosition: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  children?: React.ReactNode;
  isVisible: boolean; // Add this line
};

const DragButton: React.FC<DragButtonProps> = ({ children, initialPosition, onPositionChange, isVisible }) => {
  const [isHover] = useState(false);
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  useEffect(() => {
    const handleResize = () => {
      const currentPosition = { x: x.get(), y: y.get() };
      const newPosition = {
        x: Math.min(currentPosition.x, window.innerWidth - 120),
        y: Math.min(currentPosition.y, window.innerHeight - 120),
      };
      x.set(newPosition.x);
      y.set(newPosition.y);
      onPositionChange(newPosition);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y, onPositionChange]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newPosition = { x: info.point.x, y: info.point.y };
    const constrainedPosition = {
      x: Math.min(Math.max(newPosition.x, 0), window.innerWidth - 120),
      y: Math.min(Math.max(newPosition.y, 0), window.innerHeight - 120),
    };
    onPositionChange(constrainedPosition);
  };

  return (
    <motion.div
      className={clsx(sDragButton, { [sInvisible]: !isVisible })}
      drag
      dragMomentum={false}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      dragConstraints={{
        top: 0,
        left: 0,
        right: window.innerWidth - 120,
        bottom: window.innerHeight - 120,
      }}
      style={{ x, y }}
    >
      <DragHandle />
      <Box style={{ zIndex: 2 }}>{children}</Box>
      <Box
        className={clsx(sDragBg, {
          [animatedBG]: isHover,
        })}
      />
    </motion.div>
  );
};

export default DragButton;
