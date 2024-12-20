// src/components/feature/ChatHistory/ChatHistory.tsx

import React from "react";
import reflectButtonIcon from "~/assets/reflectButtonIcon.svg";
import { Box, Card, ScrollArea, Flex, Text } from '@radix-ui/themes';
import ScrollToBottom from "react-scroll-to-bottom";
import { motion } from "framer-motion";
import "~/styles/scrollbar.css";
import { sChatHistorySuggestCard, sChatHistory, sChatHistorySuggest, sChatHistorySuggestButtonIcon } from "./ChatHistory.css";
import { useChatHistoryLogic } from "./useChatHistoryLogic";
import { UserContent } from "~/components/ui/UserContent/UserContent";
import { AiContents } from "~/components/ui/AiContents/AiContents";
import { AiMessage, ChatHistoryItem, ErrorMessage } from "~/types";

type ChatHistoryProps = {
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  isInitVisible: boolean;
  setIsInitVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingVisible: boolean;
  createKintoneApp: (text: string) => void;
  setIsShowDetailDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ humanMessage, setHumanMessage, scrollRef, isInitVisible, isLoadingVisible, createKintoneApp, setIsShowDetailDialogVisible }) => {

  // ChatHistoryコンポーネントのロジックを管理するカスタムフック
  const {
    actionType,
    chatHistoryItems,
    animateText,
    controls,
  } = useChatHistoryLogic(isInitVisible);

  // 最新のチャット履歴アイテムを取得
  const latestChatHistoryItem = chatHistoryItems[chatHistoryItems.length - 1];

  // 初期表示
  if (isInitVisible) {
    return <Box
      className={sChatHistory}
    >
      <Flex
        justify={'start'}
        align={'start'}
        direction={'column'}
        p={'0'}
        gap={'6'}
        style={{
          paddingLeft: '6%',
          paddingTop: '6%',
          paddingRight: '6%',
          height: '100%',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <Text
            size={'8'}
            weight={'medium'}
            style={{
              color: '#5459ff', // 文字色を一律で設定
              letterSpacing: 0.8,
              lineHeight: 1.4,
              whiteSpace: "pre-wrap"
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
        <Text
          style={{
            opacity: 0.5,
            marginTop: `-1%`,
            marginBottom: `-1%`,
          }}
        >
          どのようなアプリをご希望ですか？
        </Text>
        <ScrollArea
          scrollbars='vertical'
          style={{
            height: '100%',
            width: '100%',
          }}
        >
          <Flex
            gap={'4'}
            direction={'column'}
          >
            <Card
              variant='ghost'
              className={sChatHistorySuggestCard}
              onClick={() => setHumanMessage("議事録アプリを作って")}
            >
              <Flex
                gap='4'
                className={sChatHistorySuggest}
                style={{
                  cursor: 'pointer',
                }}
              >
                <Text
                  size='2'
                  weight={'medium'}
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  議事録アプリを作って
                </Text>
                <img src={reflectButtonIcon} alt="icon" className={sChatHistorySuggestButtonIcon} />
              </Flex>
            </Card>
            <Card
              variant='ghost'
              className={sChatHistorySuggestCard}
              onClick={() => setHumanMessage("入退室記録簿というアプリ名で入退室を管理をしたい")}
            >
              <Flex
                gap='4'
                className={sChatHistorySuggest}
                style={{
                  cursor: 'pointer',
                }}
              >
                <Text
                  size='2'
                  weight={'medium'}
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  入退室記録簿というアプリ名で入退室を管理をしたい
                </Text>
                <img src={reflectButtonIcon} alt="icon" className={sChatHistorySuggestButtonIcon} />
              </Flex>
            </Card>
            <Card
              variant='ghost'
              className={sChatHistorySuggestCard}
              onClick={() => setHumanMessage("製品・カテゴリ別にお客様の苦情を記録するアプリを作成したい")}
            >
              <Flex
                gap='4'
                className={sChatHistorySuggest}
                style={{
                  cursor: 'pointer',
                }}
              >
                <Text
                  size='2'
                  weight={'medium'}
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  製品・カテゴリ別にお客様の苦情を記録するアプリを作成したい
                </Text>
                <img src={reflectButtonIcon} alt="icon" className={sChatHistorySuggestButtonIcon} />
              </Flex>
            </Card>
          </Flex>
        </ScrollArea>
      </Flex>
    </Box>;
  }

  // AI回答またはエラーメッセージの表示
  const showAiOrErrorMessage = (item: ChatHistoryItem, actionType: string) => {
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
      <AiContents
        key={item.conversationId}
        isLoadingVisible={isLoadingVisible}
        createKintoneApp={createKintoneApp}
        aiMessage={aiMessage}
        chatHistoryItem={item}
        actionType={actionType}
        setIsShowDetailDialogVisible={setIsShowDetailDialogVisible}
      />
    );
  };

  // 通常表示
  return (
    <Box className={sChatHistory}>
      <Flex
        justify={'start'}
        align={'start'}
        direction={'column'}
        p={'0'}
        style={{
          paddingLeft: '6%',
          paddingTop: '6%',
          paddingRight: '6%',
          height: '100%',
        }}
      >
        <ScrollToBottom className='w-100'>
          {/* scrollRefを上に配置することで、自動スクロールを無効にする */}
          <Box ref={scrollRef} className='scrollbar' style={{ overflowY: 'auto', maxHeight: '100%' }}>
            {latestChatHistoryItem && (
              <Flex direction={'column'}>
                <UserContent humanMessage={!isLoadingVisible ? latestChatHistoryItem.human.content : humanMessage} />
                {showAiOrErrorMessage(latestChatHistoryItem, actionType)}
              </Flex>
            )}
          </Box>
        </ScrollToBottom>
      </Flex>
    </Box>
  );
};

export default ChatHistory;
