// src/components/feature/AccordionHistory/useAccordionHistoryLogic.tsx
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { ChatContent } from "~/components/ui/ChatContent/ChatContent";
import { TypewriterEffect } from "~/components/ui/TypewriterEffect/TypewriterEffect";
import { useChatHistory } from '~/hooks/useChatHistory';
import { InTypeWriteState } from '~/state/inTypeWriteState';
import { LatestAiResponseIndexState } from '~/state/latestAiResponseIndexState';
import { ViewModeState } from '~/state/viewModeState';
import { AiMessage, ChatHistoryItem, ErrorMessage } from '~/types/ai';

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

  // AI回答またはエラーメッセージの表示
  const showAiOrErrorMessage = (item: ChatHistoryItem, index: number) => {
    let aiMessage: AiMessage | ErrorMessage
    if (item.ai) {
      // AI回答の場合
      aiMessage = item.ai
    } else if (item.error) {
      // エラーメッセージの場合
      aiMessage = item.error
    } else {
      // それ以外の場合
      return;
    }
    return (
      index + 1 === latestAiResponseIndex && inTypeWrite
        ? <TypewriterEffect aiMessage={aiMessage} chatHistoryItem={item} />
        : <ChatContent aiMessage={aiMessage} chatHistoryItem={item} />
    )
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
