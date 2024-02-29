// src/hooks/useCornerDialogLogic.tsx
import { useAtom } from "jotai";
import { useEffect, useState } from 'react';
import { LatestAiResponseIndexState, DesktopChatHistoryState, MobileChatHistoryState, ViewModeState, PluginIdState } from "~/components/feature/CornerDialog/CornerDialogState";
import { DockItemVisibleState } from '~/components/feature/Dock/DockState';
import { ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants";
import { AiMessage, ChatHistory, ChatHistoryItem, ErrorMessage, MessageType } from "~/types/ai";
import { ConversationHistoryListResponseBody, ConversationHistoryRow, ConversationHistory, KintoneProxyResponse } from "~/types/apiResponse";
import { preCheck } from "~/util/preCheck";
import { useToast } from "~/components/ui/ErrorToast/ErrorToastProvider";

export const useCornerDialogLogic = () => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const [chatHistoryItems, setChatHistory] = useAtom(isPcViewMode ? DesktopChatHistoryState : MobileChatHistoryState);
  const [desktopChatHistory, setDesktopChatHistory] = useAtom(DesktopChatHistoryState);
  const [mobileChatHistory, setMobileChatHistory] = useAtom(MobileChatHistoryState);
  const [, setLatestAiResponseIndex] = useAtom(LatestAiResponseIndexState);
  const [pluginId] = useAtom(PluginIdState);
  const [isBannerClicked, setIsBannerClicked] = useState<boolean>(false);
  const [dockState, setDockState] = useAtom(DockItemVisibleState);

  const { showToast } = useToast();

  const handleBannerClick = async () => {
    // 会話履歴一覧の取得
    await getChatHistoryItemList();
  }

  const getChatHistoryItemList = async () => {
    try {
      const appId = kintone.app.getId();
      const userId = kintone.getLoginUser().id;

      // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
      if (appId === null) {
        showErrorToast(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00001}）`);
        return;
      }
  
      // 二重押下防止
      setIsBannerClicked(true);

      // 事前チェックの呼び出し
      const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck(pluginId);
      if (resPreCheckStatus !== 200) {
        setIsBannerClicked(false);
        // APIエラーの場合、エラーメッセージ表示
        if (preCheckResult.errorCode === ErrorCode.A02002) {
          showErrorToast(`${ErrorMessageConst.E_MSG002}（${preCheckResult.errorCode}）`);
        } else {
          showErrorToast(`${ErrorMessageConst.E_MSG001}（${preCheckResult.errorCode}）`);
        }
        return;
      }

      // 会話履歴一覧取得
      const resConversationHistory = await kintone.plugin.app.proxy(
        pluginId,
        `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/list`,
        "POST",
        {},
        { appId: appId, userId: userId },
      ) as KintoneProxyResponse;
      const [resBody, resStatus] = resConversationHistory;
      const resBodyConversationHistoryList = JSON.parse(resBody) as ConversationHistoryListResponseBody;
      if (resStatus !== 200) {
        setIsBannerClicked(false);
        showErrorToast(`${ErrorMessageConst.E_MSG001}（${resBodyConversationHistoryList.errorCode}）`);
        return;
      }

      const desktopChatHistoryItemList = convertChatHistory(resBodyConversationHistoryList.desktopConversationHistoryList);
      const mobileChatHistoryItemList = convertChatHistory(resBodyConversationHistoryList.mobileConversationHistoryList);
      setDesktopChatHistory(desktopChatHistoryItemList);
      setMobileChatHistory(mobileChatHistoryItemList);
      setIsBannerClicked(false);
      setDockState(dockState => ({ ...dockState, dialogVisible: true, chatVisible: true }));
    } catch (err) {
      setIsBannerClicked(false);
      showErrorToast(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E99999}）`);
    }
  }

  // 取得した会話履歴一覧をChatHistory型に変換
  const convertChatHistory = (conversationHistoryList: ConversationHistory): ChatHistory => {
    let chatHistoryItemList: ChatHistory = [];
    conversationHistoryList.forEach((conversationHistory: ConversationHistoryRow) => {
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
        const aiMessage: AiMessage = {
          role: MessageType.ai,
          content: conversationHistory.ai_message,
          comment: conversationHistory.ai_message_comment,
        };
        chatHistoryItem["ai"] = aiMessage;
      }
      chatHistoryItemList.push(chatHistoryItem);
    });

    return chatHistoryItemList;
  }

  // エラートーストを表示
  const showErrorToast = (message: string) => {
    showToast(message, 0, false);
  }

  // 会話履歴が更新されたら会話履歴の最新のインデックスを更新
  useEffect(() => {
    if (chatHistoryItems.length) {
      setLatestAiResponseIndex(chatHistoryItems.length);
    }
  }, [chatHistoryItems]);

  useEffect(() => {
    if (dockState.chatVisible) {
      if (desktopChatHistory.length === 0 && mobileChatHistory.length === 0) {
        // 会話履歴一覧が未取得の場合、取得して表示
        getChatHistoryItemList();
      }
    }
  }, [dockState.chatVisible]);

  return {
    dockState,
    handleBannerClick,
    isBannerClicked,
    chatHistoryItems,
    setChatHistory,
  };
};
