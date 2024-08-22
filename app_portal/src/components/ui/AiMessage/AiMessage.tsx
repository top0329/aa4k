// src/components/ui/AiMessage/AiMessage.tsx

import React, { useEffect, useState } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { CreateAppButton } from "../CreateAppButton/CreateAppButton";
import { sAiMessage, sErrorAiResponseText, sErrorText } from "./AiMessage.css";
import { vars } from "~/styles/theme.css";
import useTypewriter from "~/hooks/useTypeWriter";
import { AiContentProps } from "~/types/aiContentTypes";
import { ActionType, InfoMessage, ErrorMessage } from "~/constants";
import { ShowDetailButton } from "../ShowDetailButton/ShowDetailButton";
import { useConvertToLinks } from "~/hooks/useConvertToLinks";

type AiMessageProps = AiContentProps & {
  isLoadingVisible: boolean;
  createKintoneApp: (text: string) => void;
  actionType: string;
  setIsShowDetailDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const { create, edit, duplicate, other, unknown, error } = ActionType;

export const AiMessage: React.FC<AiMessageProps> = ({ isLoadingVisible, createKintoneApp, aiMessage, /*chatHistoryItem,*/actionType, setIsShowDetailDialogVisible }) => {

  // アプリを作成するボタンを表示するかどうかの状態を管理
  const [isDisplayedCreateAppBtn, setIsDisplayedCreateAppBtn] = useState<boolean>(false);
  // アプリ情報を表示するかどうかの状態を管理（ai応答の表示後、一定時間後にアプリ情報を表示）
  const [isDisplayedAppInfo, setIsDisplayedAppInfo] = useState<boolean>(false);
  // エラーの文章を表示するかどうかの状態を管理
  const [isErrorDisplayed, setIsErrorDisplayed] = useState<boolean>(false);
  // タイプライターで表示した内容をリセットさせるかどうかの状態を管理
  const [resetTypewriter, setResetTypewriter] = useState<boolean>(false);

  // タイプライター出力
  const { role, content } = aiMessage;
  const messageDetail = role === "ai" && aiMessage.messageDetail ? aiMessage.messageDetail : "";
  const [displayedText, isTextComplete] = useTypewriter(content, !isLoadingVisible && !resetTypewriter); // メインのAI応答
  const [displayedAppInfo, isAppInfoComplete] = useTypewriter(messageDetail, isDisplayedAppInfo); // アプリの情報
  const loadingMessage = InfoMessage.I_MSG006;
  const [displayedLoadingText,] = useTypewriter(loadingMessage, isLoadingVisible); // ロード画面でのAI応答（固定）
  const errorMessage = ErrorMessage.E_MSG002;
  const [displayedErrorText,] = useTypewriter(errorMessage, isErrorDisplayed); // エラー画面でのAI応答（固定）

  // 表示内容と状態をリセットするuseEffect
  useEffect(() => {
    setIsDisplayedCreateAppBtn(false);
    setIsDisplayedAppInfo(false);
    setIsShowDetailDialogVisible(false);
    setIsErrorDisplayed(false);
    setResetTypewriter(true); // resetTypewriterをtrueに設定してuseTypewriterフックをリセット
  }, [actionType, aiMessage]);

  // resetTypewriterがtrueになった後、すぐにfalseに戻す
  useEffect(() => {
    if (resetTypewriter) {
      setResetTypewriter(false); // resetTypewriterをfalseに戻すことで、次のタイプライター効果を正常に動作させる
    }
  }, [resetTypewriter]);

  // 表示順序を調整するuseEffect
  useEffect(() => {
    if (isTextComplete && content !== "") {
      setIsDisplayedCreateAppBtn(true);
      setTimeout(() => setIsDisplayedAppInfo(true), 300);
      if (actionType === error) {
        setTimeout(() => setIsErrorDisplayed(true), 300);
      }
    }
  }, [isTextComplete, content, actionType]);

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
            <Flex direction={'column'} style={{ backgroundColor: vars.color.grayA.grayA1, borderRadius: 4 }}>
              {!isLoadingVisible && isDisplayedAppInfo && (
                <Box p={'2'} style={{ whiteSpace: "pre-wrap" }}>
                  {displayedAppInfo}
                </Box>
              )}
              {!isLoadingVisible && isAppInfoComplete && (
                <ShowDetailButton onClick={() => setIsShowDetailDialogVisible(prev => !prev)} />
              )}
            </Flex>
          </Flex>
        </Box>
      </Flex>
    );
  } else if (actionType === duplicate) {
    return (
      <Flex>
        <Box className={sAiMessage}>
          <Flex direction={'column'} gap={'4'}>
            <Box
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: useConvertToLinks(displayedText) }}>
            </Box>
          </Flex>
        </Box>
      </Flex>
    );
  } else if (actionType === other || actionType === unknown) {
    return (
      <Flex>
        <Box className={sAiMessage}>
          <Flex direction={'column'} gap={'4'}>
            <Box style={{ whiteSpace: "pre-wrap" }}>
              {displayedText}
            </Box>
          </Flex>
        </Box>
      </Flex>
    );
  } else if (actionType === error) {
    return (
      <Flex>
        <Box className={sAiMessage}>
          <Flex direction={'column'}>
            <Box className={sErrorAiResponseText} style={{ whiteSpace: "pre-wrap" }}>
              {displayedText}
            </Box>
            {isErrorDisplayed && (
              <Box className={sErrorText} style={{ whiteSpace: "pre-wrap" }}>
                {displayedErrorText}
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    );
  }
};
