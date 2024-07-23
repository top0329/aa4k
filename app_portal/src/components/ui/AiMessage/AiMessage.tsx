// src/components/ui/AiMessage/AiMessage.tsx

import React, { useEffect, useState } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { CreateAppButton } from "../CreateAppButton/CreateAppButton";
import { sAiMessage } from "./AiMessage.css";
import { vars } from "~/styles/theme.css";
import useTypewriter from "~/hooks/useTypeWriter";
import { AiContentProps } from "~/types/aiContentTypes";
import { ActionType, InfoMessage } from "~/constants";

type AiMessageProps = AiContentProps & {
  isLoadingVisible: boolean;
  createKintoneApp: (text: string) => void;
  actionType: string;
}

const { create, edit, duplicate, other, unknown, error } = ActionType;

export const AiMessage: React.FC<AiMessageProps> = ({ isLoadingVisible, createKintoneApp, aiMessage, /*chatHistoryItem,*/actionType }) => {

  // アプリを作成するボタンを表示するかどうかの状態を管理
  const [isDisplayedCreateAppBtn, setIsDisplayedCreateAppBtn] = useState<boolean>(false);
  // アプリ情報を表示するかどうかの状態を管理（ai応答の表示後、一定時間後にアプリ情報を表示）
  const [isDisplayedAppInfo, setIsDisplayedAppInfo] = useState<boolean>(false);

  // タイプライター出力
  const { role, content } = aiMessage;
  const messageDetail = role === "ai" && aiMessage.messageDetail ? aiMessage.messageDetail : "";
  const displayedText = useTypewriter(content, !isLoadingVisible); // メインのAI応答
  const displayedAppInfo = useTypewriter(messageDetail, isDisplayedAppInfo); // アプリの情報
  const loadingMessage = InfoMessage.I_MSG006;
  const displayedLoadingText = useTypewriter(loadingMessage, isLoadingVisible); // ロード画面でのAI応答（固定）

  // 「AI応答、アプリを作成するボタン、アプリ情報」の表示順序を調整するuseEffect
  useEffect(() => {
    if (displayedText === content && content !== "") {
      setIsDisplayedCreateAppBtn(true);
      setTimeout(() => setIsDisplayedAppInfo(true), 300);
    }
  }, [displayedText]);

  if (actionType === create || actionType === edit) {
    return (
      <Flex>
        <Box className={sAiMessage}>
          <Flex direction={'column'} gap={'4'}>
            <Box style={{ whiteSpace: "pre-wrap" }}>
              {!isLoadingVisible ? displayedText : displayedLoadingText}
            </Box>
            {!isLoadingVisible && isDisplayedCreateAppBtn && (
              <CreateAppButton onClick={(text) => createKintoneApp(text)} />
            )}
            {!isLoadingVisible && isDisplayedAppInfo && (
              <Box style={{ backgroundColor: vars.color.grayA.grayA1, borderRadius: 4, whiteSpace: "pre-wrap" }}>
                {displayedAppInfo}
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    );
  } else if (actionType === duplicate || actionType === other || actionType === unknown) {
    return (
      <Flex>
        <Box className={sAiMessage}>
          <Flex direction={'column'} gap={'4'}>
            <Box style={{ whiteSpace: "pre-wrap" }}>
              {!isLoadingVisible ? displayedText : displayedLoadingText}
            </Box>
          </Flex>
        </Box>
      </Flex>
    );
  } else if (actionType === error) {
    return (
      <Flex>
        <Box className={sAiMessage}>
          <Flex direction={'column'} gap={'4'}>
            <Box style={{ whiteSpace: "pre-wrap" }}>
              error
            </Box>
          </Flex>
        </Box>
      </Flex>
    );
  }
};
