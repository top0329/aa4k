// src/hooks/useCornerDialogLogic.tsx
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useUpdateEffect } from "react-use";
import { useToast } from "~/components/ui/ErrorToast/ErrorToastProvider";
import { useLoadingLogic } from "~/components/ui/Loading/useLoadingLogic";
import { ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants";
import { useChatHistory } from "~/hooks/useChatHistory";
import { useTextSpeech } from "~/hooks/useTextSpeech";
import { DesktopChatHistoryState, MobileChatHistoryState } from '~/state/chatHistoryState';
import { DockItemVisibleState } from "~/state/dockItemState";
import { LatestAiResponseIndexState } from "~/state/latestAiResponseIndexState";
import { PluginIdState } from "~/state/pluginIdState";
import { ReloadState } from "~/state/reloadState";
import { ViewModeState } from "~/state/viewModeState";
import { AiMessage, ChatHistory, ChatHistoryItem, ErrorMessage, MessageType } from "~/types/ai";
import { ConversationHistory, ConversationHistoryListResponseBody, ConversationHistoryRow, KintoneProxyResponse, KintoneRestAPiError } from "~/types/apiResponse";
import { ToastPosition } from "~/types/ToastPosition";
import { KintoneError } from "~/util/customErrors";
import { getApiErrorMessage } from '~/util/getErrorMessage';
import { preCheck } from "~/util/preCheck";

type DragPosition = { x: number; y: number };

// 起動バナーの位置を保存
const getSavedPosition = (): DragPosition | null => {
  const savedPosition = localStorage.getItem('dragButtonPosition');
  return savedPosition ? JSON.parse(savedPosition) : null;
};

export const useCornerDialogLogic = () => {
  const [isPcViewMode, setIsPcViewMode] = useAtom(ViewModeState);
  const { chatHistoryItems } = useChatHistory(isPcViewMode);
  const [, setDesktopChatHistory] = useAtom(DesktopChatHistoryState);
  const [, setMobileChatHistory] = useAtom(MobileChatHistoryState);
  const [, setLatestAiResponseIndex] = useAtom(LatestAiResponseIndexState);
  const [isReload, setIsReload] = useAtom(ReloadState);
  const [pluginId] = useAtom(PluginIdState);
  const [isBannerClicked, setIsBannerClicked] = useState<boolean>(false);
  const [isInitialChatHistory, setIsInitialChatHistory] = useState<boolean>(false);
  const [isInitVisible, setIsInitVisible] = useState<boolean>(false);
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [initialPosition, setInitialPosition] = useState<DragPosition>(() => {
    const savedPosition = getSavedPosition();
    return savedPosition || { x: window.innerWidth - 120, y: window.innerHeight - 120 };
  });
  const [humanMessage, setHumanMessage] = useState("");
  const [callbackFuncs, setCallbackFuncs] = useState<Function[] | undefined>([]);

  // Ref
  const isChangeCodeRef = useRef<boolean>(false); // コード編集中の判定を行いたい場所によってStateでは判定できないので、Refを使って判定する
  const aiAnswerRef = useRef<string>('');
  const finishAiAnswerRef = useRef<boolean>(false);

  const { showToast } = useToast();
  const { isLoading,
    startLoading,
    stopLoading
  } = useLoadingLogic(false);
  const { setDisable, isSpeech } = useTextSpeech(
    aiAnswerRef,
    finishAiAnswerRef,
  );

  // 起動バナーを押下
  const handleBannerClick = () => {
    setDockState(dockState => ({ ...dockState, dialogVisible: true }));
    // 二重押下防止
    setIsBannerClicked(true);
    // 初期ロードフラグを初期化
    setIsInitVisible(false);
  }

  // 事前チェックを実行
  const execPreCheck = async () => {
    try {
      const appId = kintone.app.getId();

      // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
      if (appId === null) {
        setIsBannerClicked(false);
        setDockState({
          dialogVisible: false,
          chatVisible: false,
          codeEditorVisible: false,
          spChatVisible: false,
        });
        showErrorToast(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00001}）`, ToastPosition.TopCenter);
        return;
      }

      // 事前チェックの呼び出し
      const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck(pluginId);
      if (resPreCheckStatus !== 200) {
        setIsBannerClicked(false);
        setDockState({
          dialogVisible: false,
          chatVisible: false,
          codeEditorVisible: false,
          spChatVisible: false,
        });
        // APIエラー時のエラーメッセージを取得
        const errorMessage = getApiErrorMessage(resPreCheckStatus, preCheckResult.errorCode);
        // APIエラーの場合、エラーメッセージ表示
        showErrorToast(errorMessage, ToastPosition.TopCenter);
        return;
      }

      setIsBannerClicked(false);
      setIsInitVisible(true);
      setIsReload(false);
    } catch (err) {
      let message: string = '';
      if (err instanceof KintoneError) {
        message = err.message;
      } else {
        message = `${ErrorMessageConst.E_MSG001}（${ErrorCode.E99999}）`;
      }
      setIsBannerClicked(false);
      setDockState({
        dialogVisible: false,
        chatVisible: false,
        codeEditorVisible: false,
        spChatVisible: false,
      });
      showErrorToast(message, ToastPosition.TopCenter);
    }
  }

  // 会話履歴一覧の取得
  const getChatHistoryItemList = async () => {
    try {
      const appId = kintone.app.getId();
      const userId = kintone.getLoginUser().id;

      // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
      if (appId === null) {
        setDockState(dockState => ({ ...dockState, chatVisible: false }));
        showErrorToast(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00001}）`);
        return;
      }

      // 会話履歴一覧取得
      const resConversationHistory = await kintone.plugin.app.proxy(
        pluginId,
        `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/list`,
        "POST",
        {},
        { appId: appId, userId: userId },
      ).catch((resBody: string) => {
        const e = JSON.parse(resBody) as KintoneRestAPiError;
        throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`);
      }) as KintoneProxyResponse;
      const [resBody, resStatus] = resConversationHistory;
      const resBodyConversationHistoryList = JSON.parse(resBody) as ConversationHistoryListResponseBody;
      if (resStatus !== 200) {
        setDockState(dockState => ({ ...dockState, chatVisible: false }));
        // APIエラー時のエラーメッセージを取得
        const errorMessage = getApiErrorMessage(resStatus, resBodyConversationHistoryList.errorCode);
        // APIエラーの場合、エラーメッセージ表示
        showErrorToast(errorMessage);
        return;
      }

      // チャット履歴の変換
      const desktopChatHistoryItemList = convertChatHistory(resBodyConversationHistoryList.desktopConversationHistoryList);
      const mobileChatHistoryItemList = convertChatHistory(resBodyConversationHistoryList.mobileConversationHistoryList);

      // チャット履歴の更新
      setDesktopChatHistory(desktopChatHistoryItemList);
      setMobileChatHistory(mobileChatHistoryItemList);

      setIsInitialChatHistory(true);
    } catch (err) {
      let message: string = '';
      if (err instanceof KintoneError) {
        message = err.message;
      } else {
        message = `${ErrorMessageConst.E_MSG001}（${ErrorCode.E99999}）`;
      }
      setDockState(dockState => ({ ...dockState, chatVisible: false }));
      showErrorToast(message);
    }
  }

  // 取得した会話履歴一覧をChatHistory型に変換
  const convertChatHistory = (conversationHistoryList: ConversationHistory): ChatHistory => {
    let chatHistoryItemList: ChatHistory = [];
    conversationHistoryList.forEach((conversationHistory: ConversationHistoryRow, index) => {
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: conversationHistory.user_message
        },
        conversationId: conversationHistory.id,
        userRating: conversationHistory.user_rating,
      };
      if (conversationHistory.error_message) {
        const errorMessage: ErrorMessage = {
          role: MessageType.error,
          content: conversationHistory.error_message,
        };
        chatHistoryItem["error"] = errorMessage;
      } else {
        let aiMessageContent = conversationHistory.ai_message || `${ErrorMessageConst.E_MSG005}（${ErrorCode.E00006}）`;
        let aiMessageComment = conversationHistory.ai_message_comment || '';
        if (isLoading && index === conversationHistoryList.length - 1) {
          // AI回答待ち中の場合、AI回答にはエラーメッセージを表示しない
          aiMessageContent = '';
          aiMessageComment = '';
        } 
        const aiMessage: AiMessage = {
          role: MessageType.ai,
          content: aiMessageContent,
          comment: aiMessageComment,
        };
        chatHistoryItem["ai"] = aiMessage;
      }
      chatHistoryItemList.push(chatHistoryItem);
    });

    return chatHistoryItemList;
  }

  // エラートーストを表示
  const showErrorToast = (message: string, position: ToastPosition = ToastPosition.TopLeft) => {
    showToast(message, 0, false, position);
  }

  // 会話履歴が更新されたら会話履歴の最新のインデックスを更新
  useEffect(() => {
    if (chatHistoryItems.length) {
      setLatestAiResponseIndex(chatHistoryItems.length);
    }
  }, [chatHistoryItems]);

  useEffect(() => {
    if (dockState.dialogVisible && !isInitVisible) {
      // Dock初回表示の場合、事前チェックを行う
      execPreCheck();
    }
    setDisable(!dockState.dialogVisible);
  }, [dockState.dialogVisible, isInitVisible]);

  useEffect(() => {
    if (dockState.chatVisible && !isInitialChatHistory) {
      // 会話モーダル初回表示の場合、会話履歴一覧を取得する
      getChatHistoryItemList();
    }
  }, [dockState.chatVisible, isInitialChatHistory]);

  // 起動バナーの位置を保存
  const savePosition = (position: DragPosition) => {
    localStorage.setItem('dragButtonPosition', JSON.stringify(position));
  };

  useEffect(() => {
    const savedPosition = getSavedPosition();
    if (savedPosition) {
      setInitialPosition(savedPosition);
    } else {
      savePosition(initialPosition);
    }
  }, [getSavedPosition]);

  const execCallbacks = () => {
    callbackFuncs?.forEach((fn) => fn());
  };

  // JS生成AI機能の呼び出し後、音声出力が完了したのを確認したのちにJS生成AI機能からのcallbacksを実行する
  useUpdateEffect(() => {
    if (dockState.dialogVisible && !isLoading && !isSpeech) {
      execCallbacks();
    }
  }, [dockState.dialogVisible, isLoading, isSpeech]);

  useEffect(() => {
    if (!isReload) {
      // 自動リロード以外でアプリ画面に遷移した場合、起動バナーのみ表示
      const initDockState = async () => {
        await setDockState({
          dialogVisible: false,
          chatVisible: false,
          codeEditorVisible: false,
          spChatVisible: false,
        });
        await setIsPcViewMode(true);
      }
      initDockState();
    }
  }, []);

  const handleBeforeunload = (event: BeforeUnloadEvent) => {
    // コードエディタのコードが編集されていたら、確認モーダルを表示
    if (isChangeCodeRef && isChangeCodeRef.current) {
      event.preventDefault();
      event.returnValue = "";
    }
  };

  useBeforeunload(handleBeforeunload);

  return {
    dockState,
    handleBannerClick,
    isBannerClicked,
    isLoading,
    startLoading,
    stopLoading,
    isChangeCodeRef,
    initialPosition,
    savePosition,
    humanMessage,
    setHumanMessage,
    setCallbackFuncs,
    execCallbacks,
    aiAnswerRef,
    finishAiAnswerRef,
    isInitVisible,
    isInitialChatHistory,
  };
};
