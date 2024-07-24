// src/components/feature/AppGenerationDialog/useAppGenerationDialogLogic.tsx

import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { InfoMessage } from '~/constants';
import { AppDialogVisibleState } from '~/state/appDialogVisibleState';

import { MessageType } from "~/constants"
import { PromptInfoListState } from '~/state/promptState';
import { SettingInfoState } from '~/state/settingInfoState';
import { SessionIdState } from "~/state/sessionIdState";
import { AppGenerationExecuteContext, AppGenerationExecuteConversation } from '~/types';

import { getApiErrorMessage } from '~/util/getErrorMessage';
import { preCheck } from '~/util/preCheck';
import { insertConversation } from "~/util/insertConversationHistory"
import { InsertConversationRequest, InsertConversationResponseBody } from "~/types/apiInterfaces"
import { appGenerationExecute } from "~/ai/appGen/appGenerationExecute"

type AppGenerationDialogProps = {
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  setAiAnswer: React.Dispatch<React.SetStateAction<string>>,
  setFinishAiAnswer: React.Dispatch<React.SetStateAction<boolean>>,
}

export const useAppGenerationDialogLogic = ({ setHumanMessage, setAiAnswer, setFinishAiAnswer }: AppGenerationDialogProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // ダイアログの表示状態を管理するアトム
  const [isVisible, setIsVisible] = useAtom(AppDialogVisibleState);
  // ダイアログが初期表示されているかどうかの状態を管理
  const [isInitVisible, setIsInitVisible] = useState<boolean>(true);
  // ロード画面を表示するかどうかの状態を管理
  const [isLoadingVisible, setIsLoadingVisible] = useState<boolean>(false);

  const [promptInfoList] = useAtom(PromptInfoListState);
  const [settingInfo] = useAtom(SettingInfoState);
  const [sessionId,] = useAtom(SessionIdState);

  // ダイアログの表示状態を切り替える
  const toggleDialogVisibility = () => {
    if (window.confirm(`${InfoMessage.I_MSG001}`)) {
      setIsVisible(false);
      setHumanMessage("");
    }
  };

  // ロード画面の表示状態を切り替える
  const toggleAiLoadVisibility = (text: string) => {
    setHumanMessage(text);
    setIsLoadingVisible(prevState => !prevState);
    setAiAnswer(`${InfoMessage.I_MSG004}`)
    setFinishAiAnswer(true);
  };

  // アプリを作成するボタン押下時の処理
  const createKintoneApp = async (text: string) => {
    toggleAiLoadVisibility(text);

    const userId = kintone.getLoginUser().id;

    // 事前チェックの呼び出し
    const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck();
    if (resPreCheckStatus !== 200) {
      // APIエラー時のエラーメッセージを取得
      const errMsgStr = getApiErrorMessage(resPreCheckStatus, preCheckResult.errorCode);
      // TODO: エラー動作
      console.log("errMsgStr:", errMsgStr)
      return;
    }
    const contractStatus = preCheckResult.contractStatus;

    // ユーザ発話の登録
    const reqConversation: InsertConversationRequest = {
      userId: userId,
      sessionId: sessionId,
      userMessage: text,
    };
    const resInsertConversation = await insertConversation(reqConversation);
    const [resBody, resInsertConversationStatus] = resInsertConversation;
    const resJsonInsertConversation = JSON.parse(resBody) as InsertConversationResponseBody;
    if (resInsertConversationStatus !== 200) {
      const errMsgStr = getApiErrorMessage(resInsertConversationStatus, resJsonInsertConversation.errorCode);
      // TODO: エラー動作
      console.log("errMsgStr:", errMsgStr)
      return;
    }
    const conversationId = resJsonInsertConversation.conversationId;

    // AI機能_アプリ作成の実行の呼び出し
    const context: AppGenerationExecuteContext = {
      userId: userId,
      conversationId: conversationId,
      sessionId: sessionId,
      settingInfo: settingInfo,
      contractStatus: contractStatus,
      promptInfoList: promptInfoList,
      isGuestSpace: false,
    }
    const conversation: AppGenerationExecuteConversation = {
      message: { role: MessageType.human, content: text },
      chatHistory: [],
      context: context,
    }
    const response = await appGenerationExecute(conversation);
    // TODO: エラー動作
    // TODO: AI機能実行後の動作

  };

  return {
    isVisible,
    setIsVisible,
    toggleDialogVisibility,
    isInitVisible,
    setIsInitVisible,
    isLoadingVisible,
    toggleAiLoadVisibility,
    createKintoneApp,
    scrollRef,
  };
};
