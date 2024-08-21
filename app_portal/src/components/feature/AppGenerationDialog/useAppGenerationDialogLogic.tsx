// src/components/feature/AppGenerationDialog/useAppGenerationDialogLogic.tsx

import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { ActionType, ExecResult, InfoMessage, MessageType } from '~/constants';
import { AppDialogVisibleState } from '~/state/appDialogVisibleState';
import { PromptInfoListState } from '~/state/promptState';
import { SettingInfoState } from '~/state/settingInfoState';
import { SessionIdState } from "~/state/sessionIdState";
import { ActionTypeState } from '~/state/actionTypeState';
import { ChatHistoryState } from '~/state/chatHistoryState';
import { getApiErrorMessage } from '~/util/getErrorMessage';
import { preCheck } from '~/util/preCheck';
import { insertConversation } from "~/util/insertConversationHistory"
import { ErrorMessage, AppGenerationExecuteContext, AppGenerationExecuteConversation, ChatHistoryItem } from '~/types';
import { InsertConversationRequest, InsertConversationResponseBody } from "~/types/apiInterfaces"
import { appGenerationExecute } from "~/ai/appGen/appGenerationExecute"

type AppGenerationDialogProps = {
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  setCallbackFuncs: React.Dispatch<React.SetStateAction<Function[] | undefined>>;
  setAiAnswer: React.Dispatch<React.SetStateAction<string>>,
  setFinishAiAnswer: React.Dispatch<React.SetStateAction<boolean>>,
  setIsShowDetailDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAppGenerationDialogLogic = ({ setHumanMessage, setCallbackFuncs, setAiAnswer, setFinishAiAnswer, setIsShowDetailDialogVisible }: AppGenerationDialogProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [chatHistoryItems, setChatHistory] = useAtom(ChatHistoryState);
  // ダイアログの表示状態を管理するアトム
  const [isVisible, setIsVisible] = useAtom(AppDialogVisibleState);
  // AI応答のアクション種別を管理
  const [, setActionType] = useAtom(ActionTypeState);
  const [promptInfoList] = useAtom(PromptInfoListState);
  const [settingInfo] = useAtom(SettingInfoState);
  const [sessionId,] = useAtom(SessionIdState);
  // ダイアログが初期表示されているかどうかの状態を管理
  const [isInitVisible, setIsInitVisible] = useState<boolean>(true);
  // ロード画面を表示するかどうかの状態を管理
  const [isLoadingVisible, setIsLoadingVisible] = useState<boolean>(false);

  // ダイアログの表示状態を切り替える
  const toggleDialogVisibility = () => {
    if (window.confirm(`${InfoMessage.I_MSG001}`)) {
      setIsVisible(false);
      setHumanMessage("");
      setIsShowDetailDialogVisible(false);
    }
  };

  // ロード画面の表示状態を切り替える
  const toggleAiLoadVisibility = (text: string) => {
    setHumanMessage(text);
    setIsLoadingVisible(prevState => !prevState);
  };

  // アプリを作成するボタン押下時の処理
  const createKintoneApp = async (text: string) => {
    toggleAiLoadVisibility(text);
    setAiAnswer(`${InfoMessage.I_MSG004}`);
    setFinishAiAnswer(true);
    setIsShowDetailDialogVisible(false);

    const userId = kintone.getLoginUser().id;

    // 事前チェックの呼び出し
    const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck();
    if (resPreCheckStatus !== 200) {
      // APIエラー時のエラーメッセージを取得
      const errMsgStr = getApiErrorMessage(resPreCheckStatus, preCheckResult.errorCode);
      console.log("errMsgStr:", errMsgStr)

      const errorMessage: ErrorMessage = {
        role: MessageType.error,
        content: errMsgStr
      };
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: text,
        },
        error: errorMessage,
        conversationId: "",
      };
      toggleAiLoadVisibility(text);
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setHumanMessage("");
      setActionType(ActionType.error);
      return;
    }
    const contractStatus = preCheckResult.contractStatus;
    const systemSettings = preCheckResult.systemSettings;

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
      console.log("errMsgStr:", errMsgStr)

      const errorMessage: ErrorMessage = {
        role: MessageType.error,
        content: errMsgStr
      };
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: text,
        },
        error: errorMessage,
        conversationId: "",
      };
      toggleAiLoadVisibility(text);
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setHumanMessage("");
      setActionType(ActionType.error);
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
      systemSettings: systemSettings,
    }
    const conversation: AppGenerationExecuteConversation = {
      message: { role: MessageType.human, content: text },
      chatHistory: [],
      context: context,
    }
    const response = await appGenerationExecute(conversation);
    if (response.result === ExecResult.error) {
      const errorMessage: ErrorMessage = {
        role: MessageType.error,
        content: response.errorMessage
      };
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: text,
        },
        error: errorMessage,
        conversationId: "",
      };
      toggleAiLoadVisibility(text);
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setHumanMessage("");
      setActionType(ActionType.error);
      return;
    }
    setCallbackFuncs(response.callbacks);
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
