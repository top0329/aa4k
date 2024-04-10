// src/components/feature/AccordionHistory/AccordionHistory.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { Box, Card, Flex, ScrollArea, Text } from '@radix-ui/themes';
import clsx from 'clsx';
import { motion } from "framer-motion";
import ScrollToBottom from "react-scroll-to-bottom";
import AccordionContent from '~/components/ui/Accordion/AccordionContent';
import AccordionTrigger from '~/components/ui/Accordion/AccordionTrigger';
import { ChatContent } from "~/components/ui/ChatContent/ChatContent";
import { TypewriterEffect } from "~/components/ui/TypewriterEffect/TypewriterEffect";
import "~/styles/scrollbar.css";
import { vars } from '~/styles/theme.css';
import { AiMessage, ChatHistoryItem, ErrorMessage } from '~/types/ai';
import { sChatHistory, sChatHistoryItem, sChatHistorySuggest, sChatScroll, sChatScrollInner } from './AccordionHistory.css';
import { useAccordionHistoryLogic } from './useAccordionHistoryLogic';

type AccordionHistoryProps = {
  isLoading: boolean;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const AccordionHistory: React.FC<AccordionHistoryProps> = ({ isLoading, setHumanMessage, scrollRef }) => {
  const {
    animateText,
    controls,
    chatHistoryItems,
    latestAiResponseIndex,
    isPcViewMode,
    inTypeWrite,
    activeItem,
    setActiveItem,
  } = useAccordionHistoryLogic();

  // 空の状態
  if (chatHistoryItems.length === 0 && !isLoading) {
    return <Box
      className={sChatHistory}
    >
      <Flex
        justify={'between'}
        align={'center'}
        direction={'column'}
        p={'9'}
        gap={'9'}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <Text
            size={'8'}
            color={'gray'}
            weight={'bold'}
            style={{
              opacity: 0.18,
              letterSpacing: 0.8,
              lineHeight: 1.8
            }}>
            {animateText.split("").map((letter, index) => (
              <motion.span
                key={index}
                custom={index}
                initial={{ opacity: 0 }}
                animate={controls}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </Text>
        </motion.div>
        <ScrollArea
          scrollbars='horizontal'
          style={{
            height: 160,
            width: '100%',
          }}
        >
          <Flex
            gap={'4'}
          >
            <Card
              variant='ghost'
              onClick={() => setHumanMessage("kintoneのカスタマイズjsでよくある実装はなんでしょうか？")}
              style={{
                cursor: 'pointer',
              }}
            >
              <Flex gap='4' align='start'
                className={sChatHistorySuggest}
                style={isPcViewMode ? {
                  background: vars.color.primaryBg,
                } : {
                  background: vars.color.accentBg,
                }}
              >
                <Text size='2' color={
                  isPcViewMode ? 'iris' : 'cyan'
                }>
                  kintoneのカスタマイズjsでよくある実装はなんでしょうか？
                </Text>
              </Flex>
            </Card>
            <Card
              variant='ghost'
              onClick={() => setHumanMessage("日付フィールドを今日の日付で自動的に埋める機能のコードを生成してください。")}
              style={{
                cursor: 'pointer',
              }}
            >
              <Flex gap='4' align='start' className={sChatHistorySuggest}
                style={isPcViewMode ? {
                  background: vars.color.primaryBg,
                } : {
                  background: vars.color.accentBg,
                }}
              >
                <Text size='2' color={
                  isPcViewMode ? 'iris' : 'cyan'
                }>
                  日付フィールドを今日の日付で自動的に埋める機能のコードを生成してください。
                </Text>
              </Flex>
            </Card>
          </Flex>
        </ScrollArea>
      </Flex>
    </Box>;
  }

  // AI回答またはエラーメッセージの表示
  const showAiOrErrorMessage = (item: ChatHistoryItem, index: number) => {
    let aiMessage: AiMessage | ErrorMessage;

    if (item.ai) {
      // AI回答の場合
      aiMessage = item.ai;
    } else if (item.error) {
      // エラーメッセージの場合
      aiMessage = item.error;
    } else {
      // それ以外の場合
      return;
    }

    return (
      index + 1 === latestAiResponseIndex && inTypeWrite
        ? <TypewriterEffect aiMessage={aiMessage} chatHistoryItem={item} isLoading={isLoading} />
        : <ChatContent humanMessage={item.human.content} aiMessage={aiMessage} chatHistoryItem={item} />
    );
  };

  return (
    <Accordion.Root
      className={sChatHistory}
      type="single"
      value={activeItem}
      onValueChange={setActiveItem}
      collapsible
    >
      <ScrollToBottom
        className={clsx(sChatScroll, 'w-100')}
        scrollViewClassName={clsx(sChatScrollInner, 'scrollbar')}
      >
        {chatHistoryItems.map((item, index) => (
          <Accordion.Item className={sChatHistoryItem} value={`item-${index}`} key={index}>
            <AccordionTrigger isOpen={activeItem === `item-${index}`} text={item.human.content} />
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
                  padding: '0 16px'
                }}
              >
                {showAiOrErrorMessage(item, index)}
              </AccordionContent>
            </motion.div>
          </Accordion.Item>
        ))}
        <div ref={scrollRef}></div>
      </ScrollToBottom>
    </Accordion.Root>
  );
};

export default AccordionHistory;
