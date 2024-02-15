// src/components/feature/AccordionHistory/useAccordionHistoryLogic.tsx
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { ChatContent } from "~/components/ui/ChatContent/ChatContent";
import { TypewriterEffect } from "~/components/ui/TypewriterEffect/TypewriterEffect";
import { AiMessage, ChatHistoryItem, ErrorMessage } from '~/types/ai';
import { InTypeWriteState, LatestAiResponseIndexState, PcChatHistoryState, SpChatHistoryState, ViewModeState } from '../CornerDialog/CornerDialogState';

export const useAccordionHistoryLogic = () => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const [chatHistoryItems] = useAtom(isPcViewMode ? PcChatHistoryState : SpChatHistoryState);
  const [latestAiResponseIndex] = useAtom(LatestAiResponseIndexState);
  const [inTypeWrite] = useAtom(InTypeWriteState);
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    if (chatHistoryItems.length > 0) {
      setActiveItem(`item-${chatHistoryItems.length - 1}`);
    }
  }, [chatHistoryItems]);

  // AI回答またはエラーメッセージの表示
  const showAiOrErrorMessage = (item: ChatHistoryItem, index: number) => {
    let aiMessage: AiMessage | ErrorMessage
    if (item.ai) {
      aiMessage = item.ai
    } else if (item.error) {
      aiMessage = item.error
    } else {
      return;
    }
    return (index + 1 === latestAiResponseIndex && inTypeWrite ? <TypewriterEffect aiMessage={aiMessage} /> : <ChatContent aiMessage={aiMessage} />)
  }

  return {
    chatHistoryItems,
    latestAiResponseIndex,
    inTypeWrite,
    activeItem,
    setActiveItem,
    showAiOrErrorMessage,
  }
}
