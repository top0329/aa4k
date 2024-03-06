// src/components/feature/AccordionHistory/AccordionHistory.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { Box } from '@radix-ui/themes';
import AccordionContent from '~/components/ui/Accordion/AccordionContent';
import AccordionTrigger from '~/components/ui/Accordion/AccordionTrigger';
import { ChatContent } from "~/components/ui/ChatContent/ChatContent";
import { TypewriterEffect } from "~/components/ui/TypewriterEffect/TypewriterEffect";
import { AiMessage, ChatHistoryItem, ErrorMessage } from '~/types/ai';
import { sChatHistory, sChatHistoryItem } from './AccordionHistory.css';
import { useAccordionHistoryLogic } from './useAccordionHistoryLogic';

type AccordionHistoryProps = {
  isLoading: boolean;
}

export const AccordionHistory: React.FC<AccordionHistoryProps> = ({ isLoading }) => {
  const {
    chatHistoryItems,
    latestAiResponseIndex,
    inTypeWrite,
    activeItem,
    setActiveItem,
  } = useAccordionHistoryLogic();

  // 空の状態
  if (chatHistoryItems.length === 0) {
    return <Box></Box>;
  }

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
        ? <TypewriterEffect aiMessage={aiMessage} chatHistoryItem={item} isLoading={isLoading} />
        : <ChatContent aiMessage={aiMessage} chatHistoryItem={item} />
    )
  }

  return (
    <Accordion.Root
      className={sChatHistory}
      type="single"
      value={activeItem}
      onValueChange={setActiveItem}
      collapsible
    >
      <Box pt={'4'}>
        {chatHistoryItems.map((item, index) => (
          <Accordion.Item className={sChatHistoryItem} value={`item-${index}`} key={index}>
            <AccordionTrigger isOpen={activeItem === `item-${index}`} text={item.human.content} />
            <AccordionContent
              style={{
                padding: '0 16px'
              }}
            >
              {showAiOrErrorMessage(item, index)}
            </AccordionContent>
          </Accordion.Item>
        ))
        }
      </Box>
    </Accordion.Root >
  )
}

export default AccordionHistory;
