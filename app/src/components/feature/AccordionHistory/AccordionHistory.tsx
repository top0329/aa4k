// src/components/feature/AccordionHistory/AccordionHistory.tsx
import * as Accordion from '@radix-ui/react-accordion';
import AccordionContent from '~/components/ui/Accordion/AccordionContent';
import AccordionTrigger from '~/components/ui/Accordion/AccordionTrigger';
import { Conversation } from '~/types/agents';
import { sChatHistory, sChatHistoryItem } from './AccordionHistory.css';

type AccordionHistoryProps = {
  conversations: Conversation[];
};

export const AccordionHistory = ({ conversations }: AccordionHistoryProps) => (
  <Accordion.Root className={sChatHistory} type="single"
    defaultValue={`item-${conversations.length - 1}`}
    collapsible>
    {conversations.map((conversation, index) => (
      <Accordion.Item className={sChatHistoryItem} value={`item-${index}`} key={index}>
        <AccordionTrigger>{conversation.message.content}</AccordionTrigger>
        {conversation.chatHistory?.map(aiMessage => (
          <AccordionContent
            key={aiMessage.content}
          >{aiMessage.content}</AccordionContent>
        ))}
      </Accordion.Item>
    ))}
  </Accordion.Root>
);

export default AccordionHistory;