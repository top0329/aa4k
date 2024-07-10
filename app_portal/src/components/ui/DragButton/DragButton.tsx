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
  isVisible: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement> | null) => void;
  disabled?: boolean;
};

const DragButton = React.forwardRef(({
  initialPosition,
  onPositionChange,
  children,
  isVisible,
  onClick,
  disabled,
}: DragButtonProps, ref: React.Ref<HTMLDivElement>) => {
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const newPosition = { x: info.point.x, y: info.point.y };
    const constrainedPosition = {
      x: Math.min(Math.max(newPosition.x, 0), window.innerWidth - 120),
      y: Math.min(Math.max(newPosition.y, 0), window.innerHeight - 120),
    };
    onPositionChange(constrainedPosition);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement> | null) => {
    if (!isDragging && event && !event.defaultPrevented) {
      onClick(event);
    }
  };

  return (
    <motion.div
      className={clsx(sDragButton, { [sInvisible]: !isVisible })}
      drag={!disabled}
      dragMomentum={false}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={event => handleClick(event)}
      dragConstraints={{
        top: 0,
        left: 0,
        right: window.innerWidth - 120,
        bottom: window.innerHeight - 120,
      }}
      style={{ x, y }}
      ref={ref}
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
});

export default DragButton;
