// src/hooks/useCornerDialogLogic.tsx
import { useAtom } from "jotai";
import { useEffect, useState } from 'react';
import { LatestAiResponseIndexState, PcChatHistoryState, SpChatHistoryState, ViewModeState } from "~/components/feature/CornerDialog/CornerDialogState";
import { useDockLogic } from "~/components/feature/Dock/useDockLogic";
import { DeviceDiv, ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants";
import { AiMessage, ChatHistory, ChatHistoryItem, ErrorMessage, MessageType } from "~/types/ai";
import { ConversationHistoryListResponseBody, ConversationHistoryRow, KintoneProxyResponse } from "~/types/apiResponse";
import { preCheck } from "~/util/preCheck";
import { isCodeActionDialogState } from "../CodeActionDialog/CodeActionDialogState";
import { DockItemVisibleState } from "../Dock/DockState";

export const useCornerDialogLogic = () => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const [chatHistoryItems, setChatHistory] = useAtom(isPcViewMode ? PcChatHistoryState : SpChatHistoryState);
  const [, setLatestAiResponseIndex] = useAtom(LatestAiResponseIndexState);
  const [isBannerClicked, setIsBannerClicked] = useState<boolean>(false);
  const [dockItemVisible, setDockItemVisible] = useAtom(DockItemVisibleState);
  const [isCodeActionDialog] = useAtom(isCodeActionDialogState);

  // doc logic
  const { dockState, toggleItemVisibility, initDockState } = useDockLogic();

  const handleBannerClick = async () => {
    const appId = kintone.app.getId();
    const userId = kintone.getLoginUser().id;

    // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
    if (appId === null) {
      initDockState();
      alert(`${ErrorMessageConst.UnavailableScreen}`);
      return;
    }

    // 二重押下防止
    setIsBannerClicked(true);

    // 事前チェックの呼び出し
    const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck();
    if (resPreCheckStatus !== 200) {
      initDockState();
      setIsBannerClicked(false);
      // APIエラーの場合、エラーメッセージ表示
      if (preCheckResult.errorCode === ErrorCode.A02002) {
        alert(`${ErrorMessageConst.unsupportedVersion}（${preCheckResult.errorCode}）`);
      } else {
        alert(`${ErrorMessageConst.currentlyUnavailable}（${preCheckResult.errorCode}）`);
      }
      return;
    }

    // 会話履歴一覧取得
    const resConversationHistory = await kintone.proxy(
      `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/list`,
      "POST",
      { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
      { appId: appId, userId: userId, deviceDiv: DeviceDiv.desktop },
    ) as KintoneProxyResponse;
    const [resBody, resStatus] = resConversationHistory;
    const resBodyConversationHistoryList = JSON.parse(resBody) as ConversationHistoryListResponseBody;
    if (resStatus !== 200) {
      initDockState();
      setIsBannerClicked(false);
      alert(`${ErrorMessageConst.currentlyUnavailable}（${resBodyConversationHistoryList.errorCode}）`);
      return;
    }

    const conversationHistoryList = resBodyConversationHistoryList.conversationHistoryList || [];
    let chatHistoryItemList: ChatHistory = [];
    conversationHistoryList.forEach((conversationHistory: ConversationHistoryRow) => {
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: conversationHistory.user_message
        },
        conversationId: conversationHistory.id
      };
      if (conversationHistory.error_message) {
        const errorMessage: ErrorMessage = {
          role: MessageType.error,
          content: conversationHistory.error_message
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
    setChatHistory(chatHistoryItemList);
    setIsBannerClicked(false);
    toggleItemVisibility('dialogVisible');
  }

  // 会話履歴が更新されたら会話履歴の最新のインデックスを更新
  useEffect(() => {
    if (chatHistoryItems.length) {
      setLatestAiResponseIndex(chatHistoryItems.length);
    }
  }, [chatHistoryItems]);

  return {
    dockState,
    handleBannerClick,
    isBannerClicked,
    isCodeActionDialog,
    dockItemVisible,
    setDockItemVisible,
  };
};
