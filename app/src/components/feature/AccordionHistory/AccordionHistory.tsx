// src/components/feature/AccordionHistory/AccordionHistory.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { Box } from '@radix-ui/themes';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import AccordionContent from '~/components/ui/Accordion/AccordionContent';
import AccordionTrigger from '~/components/ui/Accordion/AccordionTrigger';
import { ChatContent } from "~/components/ui/ChatContent/ChatContent";
import { TypewriterEffect } from "~/components/ui/TypewriterEffect/TypewriterEffect";
import { ChatHistoryState, InTypeWriteState, LatestAiResponseIndexState } from '../CornerDialog/CornerDialogState';
import { sChatHistory, sChatHistoryItem } from './AccordionHistory.css';
import { ChatHistoryItem, AiMessage, ErrorMessage } from '~/types/ai';

export const AccordionHistory = () => {
  const [chatHistoryItems] = useAtom(ChatHistoryState);
  const [latestAiResponseIndex] = useAtom(LatestAiResponseIndexState);
  const [inTypeWrite] = useAtom(InTypeWriteState);
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    if (chatHistoryItems.length > 0) {
      setActiveItem(`item-${chatHistoryItems.length - 1}`);
    }
  }, [chatHistoryItems]);

  // 空の状態
  if (chatHistoryItems.length === 0) {
    return <Box></Box>;
  }

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

  return (
    <Accordion.Root
      className={sChatHistory}
      type="single"
      value={activeItem}
      onValueChange={setActiveItem}
      collapsible
    >
      {chatHistoryItems.map((item, index) => (
        <Accordion.Item className={sChatHistoryItem} value={`item-${index}`} key={index}>
          <AccordionTrigger>{item.human.content}</AccordionTrigger>
          <AccordionContent>
            {showAiOrErrorMessage(item, index)}
          </AccordionContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}

export default AccordionHistory;
