// src/components/feature/AccordionHistory/useAccordionHistoryLogic.tsx
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useChatHistory } from '~/hooks/useChatHistory';
import { InTypeWriteState } from '~/state/inTypeWriteState';
import { LatestAiResponseIndexState } from '~/state/latestAiResponseIndexState';
import { ViewModeState } from '~/state/viewModeState';

export const useAccordionHistoryLogic = () => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const { chatHistoryItems } = useChatHistory(isPcViewMode);
  const [latestAiResponseIndex] = useAtom(LatestAiResponseIndexState);
  const [inTypeWrite] = useAtom(InTypeWriteState);
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    if (chatHistoryItems.length > 0) {
      setActiveItem(`item-${chatHistoryItems.length - 1}`);
    }
  }, [chatHistoryItems]);

  return {
    chatHistoryItems,
    latestAiResponseIndex,
    inTypeWrite,
    activeItem,
    setActiveItem,
  }
}
