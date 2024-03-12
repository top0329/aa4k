// src/components/ui/DragButton/DragButton.tsx
import { Box } from '@radix-ui/themes';
import clsx from 'clsx';
import { motion, useMotionValue } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import DragHandle from '../DragHandle/DragHandle';
import { animatedBG, sDragBg, sDragButton } from './DragButton.css';

type DragButtonProps = {
  initialPosition: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  children?: React.ReactNode;
};

const DragButton: React.FC<DragButtonProps> = ({ initialPosition, onPositionChange, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  useEffect(() => {
    const handleResize = () => {
      const currentPosition = { x: x.get(), y: y.get() };
      if (isOffScreen(currentPosition)) {
        const newPosition = getInitialPosition();
        x.set(newPosition.x);
        y.set(newPosition.y);
        onPositionChange(newPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y, onPositionChange]);

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = () => {
    const newPosition = { x: x.get(), y: y.get() };
    if (isOffScreen(newPosition)) {
      confirm('ボタンがウィンドウ外に出ました。初期位置に戻します。');
      resetToInitialPosition();
    } else {
      onPositionChange(newPosition);
    }
    setIsDragging(false);
  };

  const getInitialPosition = () => ({
    x: window.innerWidth - 120,
    y: window.innerHeight - 120,
  });

  const isOffScreen = (position: { x: number; y: number }) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    return (
      position.x < 0 ||
      position.y < 0 ||
      position.x > screenWidth ||
      position.y > screenHeight
    );
  };

  const resetToInitialPosition = () => {
    const initialPosition = getInitialPosition();
    x.set(initialPosition.x);
    y.set(initialPosition.y);
    onPositionChange(initialPosition);
  };

  return (
    <motion.div
      className={sDragButton}
      drag
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        x,
        y,
      }}
    >
      <DragHandle />
      <Box
        style={{
          pointerEvents: isDragging ? 'none' : 'auto',
          zIndex: 2,
        }}
      >
        {children}
      </Box>
      <Box
        className={clsx(sDragBg, {
          [animatedBG]: isHover,
        })}
      />
    </motion.div>
  );
};

export default DragButton;
