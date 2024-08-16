
// src/components/feature/DataGen/Chat/useChatLogic.tsx
import { useRef } from 'react';
import useToggleDockItem from '~/hooks/useToggleDockItem';

export const useChatLogic = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {
    toggleItemVisibility,
  } = useToggleDockItem();

  return {
    toggleItemVisibility,
    scrollRef
  };
};
