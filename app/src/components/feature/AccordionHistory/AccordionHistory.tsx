// src/components/feature/AccordionHistory/AccordionHistory.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { Box } from '@radix-ui/themes';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import RatingToolbar from '~/components/feature/RatingToolbar/RatingToolbar';
import AccordionContent from '~/components/ui/Accordion/AccordionContent';
import AccordionTrigger from '~/components/ui/Accordion/AccordionTrigger';
import { ConversationsState } from '../CornerDialog/CornerDialogState';
import { sChatHistory, sChatHistoryItem } from './AccordionHistory.css';

export const AccordionHistory = () => {
  const [conversations] = useAtom(ConversationsState);
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    if (conversations.length > 0) {
      setActiveItem(`item-${conversations.length - 1}`);
    }
  }, [conversations]);

  // 空の状態
  if (conversations.length === 0) {
    return <Box></Box>;
  }

  return (
    <Accordion.Root
      className={sChatHistory}
      type="single"
      value={activeItem}
      onValueChange={setActiveItem}
      collapsible
    >
      {conversations.map((conversation, index) => (
        <Accordion.Item className={sChatHistoryItem} value={`item-${index}`} key={index}>
          <AccordionTrigger>{conversation.message.content}</AccordionTrigger>
          {conversation.chatHistory?.map(aiMessage => (
            <AccordionContent
              style={{
                padding: '0 16px'
              }}
              key={aiMessage.content}
            >
              <Box
                style={{
                  whiteSpace: "pre-wrap"
                }}
              >
                固定文言
              </Box>
              <Box
                style={{
                  whiteSpace: "pre-wrap"
                }}
              >
                {aiMessage.content}
              </Box>
              <Box
                mt={'5'}
                width={'100%'}
              >
                <RatingToolbar content={aiMessage.content} />
              </Box>
            </AccordionContent>
          ))}
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
};

export default AccordionHistory;
