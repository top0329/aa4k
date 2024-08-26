// src\components\feature\AccordionShowDetail\AccordionShowDetail.tsx

import React from "react";
import * as Accordion from '@radix-ui/react-accordion';
import { ScrollArea } from '@radix-ui/themes';
import "~/styles/scrollbar.css";
import { motion } from 'framer-motion';
import AccordionTrigger from '~/components/ui/Accordion/AccordionTrigger';
import AccordionContent from '~/components/ui/Accordion/AccordionContent';
import { DefaultFieldContent } from '~/components/ui/DefaultFieldContent/DefaultFieldContent';
import { sAccordionShowDetail, sAccordionShowDetailItem } from './AccordionShowDetail.css';
import { useAccordionShowDetailLogic } from './useAccordionShowDetailLogic';

type AccordionShowDetailProps = {
  showDetailDialogScrollRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const AccordionShowDetail: React.FC<AccordionShowDetailProps> = ({ showDetailDialogScrollRef }) => {
  const {
    settingInfoItems,
    activeItem,
    setActiveItem,
    lastChatHistoryItem,
  } = useAccordionShowDetailLogic();

  return (
    <Accordion.Root
      className={sAccordionShowDetail}
      type="single"
      value={activeItem} // 現在選択されているAccordion.Itemのvalueと一致すると、対象のアイテムを展開する
      onValueChange={setActiveItem}
      collapsible
    >
      <ScrollArea
        scrollbars='vertical'
        type='auto'
        ref={showDetailDialogScrollRef}
      >
        {lastChatHistoryItem && lastChatHistoryItem.conversationId && settingInfoItems && settingInfoItems.fields.map((item, index) => {
          const contentText = item.label.slice(13);
          return (
            <Accordion.Item
              className={sAccordionShowDetailItem}
              value={`item-${index}`} // 各Accordion.Itemに一意の値を設定（トリガーをクリックするとvalueがRootのonValueChangeコールバック関数に渡される）
              key={index}
            >
              <AccordionTrigger isOpen={activeItem === `item-${index}`} text={item} hasContent={!!contentText} />
              {contentText && (
                <motion.div
                  key={index}
                  // isOpenが変更されたときにアニメーションを実行
                  animate={activeItem === `item-${index}` ? 'open' : 'closed'}
                  variants={{
                    open: {
                      opacity: 1,
                      height: 'auto',
                      transition: { duration: 0.3 } // openのアニメーション設定
                    },
                    closed: {
                      opacity: 0,
                      height: 0,
                      transition: { duration: 0.2 } // closedのアニメーション設定
                    }
                  }}
                >
                  <AccordionContent
                    style={{
                      padding: '0 16px',
                      cursor: 'auto',
                    }}
                  >
                    {contentText}
                  </AccordionContent>
                </motion.div>
              )}
            </Accordion.Item>
          );
        })}
        <DefaultFieldContent />
      </ScrollArea>
    </Accordion.Root>
  );
};

export default AccordionShowDetail;
