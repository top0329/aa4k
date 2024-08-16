
// src/components/feature/JsGen/Chat/useChatLogic.tsx
import { useRef } from 'react';
import useToggleDockItem from '~/hooks/useToggleDockItem';

export const useChatLogic = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {
    toggleChatVisibility
  } = useToggleDockItem();

  return {
    toggleChatVisibility,
    scrollRef
  };
};
