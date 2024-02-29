// src/components/feature/AccordionHistory/AccordionHistory.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { Box } from '@radix-ui/themes';
import AccordionContent from '~/components/ui/Accordion/AccordionContent';
import AccordionTrigger from '~/components/ui/Accordion/AccordionTrigger';
import { sChatHistory, sChatHistoryItem } from './AccordionHistory.css';
import { useAccordionHistoryLogic } from './useAccordionHistoryLogic';

export const AccordionHistory = () => {
  const { chatHistoryItems, activeItem, setActiveItem, showAiOrErrorMessage } = useAccordionHistoryLogic();

  // 空の状態
  if (chatHistoryItems.length === 0) {
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
      ))}
    </Accordion.Root>
  )
}

export default AccordionHistory;
