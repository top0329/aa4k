
// src/components/feature/Chat/useChatLogic.tsx
import { useRef } from 'react';

export const useChatLogic = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return {
    scrollRef
  };
};
