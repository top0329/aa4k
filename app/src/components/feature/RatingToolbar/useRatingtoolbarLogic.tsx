// src/components/feature/RatingToolbar/useRatingtoolbarLogic.tsx
import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { useToast } from "~/components/ui/ErrorToast/ErrorToastProvider";
// TODO：ステート管理のリファクタリングで修正予定
import { DesktopChatHistoryState, MobileChatHistoryState, ViewModeState } from "~/components/feature/CornerDialog/CornerDialogState";
import { PluginIdState } from "~/components/feature/CornerDialog/CornerDialogState";
import { UserRating, ErrorMessage } from '~/constants';
import { ChatHistoryItem } from "~/types/ai";
import { KintoneProxyResponse, KintoneProxyResponseBody } from "~/types/apiResponse";

// src/components/feature/RatingToolbar/useRatingtoolbar.tsx
export const useRatingToolbarLogic = (chatHistoryItem: ChatHistoryItem) => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const [chatHistoryItems, setChatHistory] = useAtom(isPcViewMode ? DesktopChatHistoryState : MobileChatHistoryState);
  const [thumbsUpPressed, setThumbsUpPressed] = useState(false);
  const [thumbsDownPressed, setThumbsDownPressed] = useState(false);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [activeConversationId, ] = useState<string>(chatHistoryItem.conversationId);
  const [feedback, setFeedback] = useState('');
  const [pluginId] = useAtom(PluginIdState);

  const { showToast } = useToast();

  // Goodボタン押下時
  const handleThumbsUpClick = async () => {
    if (thumbsUpPressed || thumbsDownPressed) {
      // ユーザー評価済みの場合は、フィードバック入力欄を表示
      setShowDetailedFeedback(true);
    } else {
      // ユーザー評価未済の場合は、ユーザー評価を更新
      if (!(await updateUserRating(UserRating.good))) return;
      setThumbsUpPressed(true);
      setShowDetailedFeedback(true);
    }
  };

  // Badボタン押下時
  const handleThumbsDownClick = async () => {
    if (thumbsUpPressed || thumbsDownPressed) {
      // ユーザー評価済みの場合は、フィードバック入力欄を表示
      setShowDetailedFeedback(true);
    } else {
      // ユーザー評価未済の場合は、ユーザー評価を更新
      if (!(await updateUserRating(UserRating.bad))) return;
      setThumbsDownPressed(true);
      setShowDetailedFeedback(true);
    }
  };

  // フィードバック送信ボタン押下時
  const handleFeedbackSendClick = async () => {
    // ユーザー評価コメント更新(※ユーザー評価コメント更新でエラーが発生しても、画面にはエラーメッセージは表示しない)
    await kintone.plugin.app.proxy(
      pluginId,
      `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/update-user-rating`,
      "POST",
      {},
      { conversationId: activeConversationId, userRating: chatHistoryItem.userRating, userRatingComment: feedback },
    ) as KintoneProxyResponse;
    setFeedback('');
    setShowDetailedFeedback(false);
  }

  useEffect(() => {
    // ユーザー評価状態の更新
    const isThumbsUp = (chatHistoryItem.userRating && chatHistoryItem.userRating === UserRating.good) ? true : false;
    const isDownUp = (chatHistoryItem.userRating && chatHistoryItem.userRating === UserRating.bad) ? true : false;
    setThumbsUpPressed(isThumbsUp);
    setThumbsDownPressed(isDownUp);
  }, []);

  // ユーザー評価更新
  const updateUserRating = async (userRating: UserRating): Promise<boolean> => {
    const resUpdateUserRating = await kintone.plugin.app.proxy(
      pluginId,
      `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/update-user-rating`,
      "POST",
      {},
      { conversationId: activeConversationId, userRating: userRating },
    ) as KintoneProxyResponse;
    const [resBody, resStatus] = resUpdateUserRating;
    const resBodyUpdateUserRating = JSON.parse(resBody) as KintoneProxyResponseBody;
    if (resStatus !== 200) {
      // トーストでエラーメッセージ表示
      showToast(`${ErrorMessage.E_MSG001}（${resBodyUpdateUserRating.errorCode}）`, 3000, true);
      return false;
    }

    updateConversationRating(userRating);
    return true;
  }

  // 会話履歴Stateの更新(ユーザー評価)
  const updateConversationRating = (newUserRating: UserRating) => {
    const chatHistoryItem = chatHistoryItems.find(c => c.conversationId === activeConversationId);
    if (chatHistoryItem) {
      chatHistoryItem.userRating = newUserRating;
    }
    setChatHistory(chatHistoryItems);
  }

  return {
    thumbsUpPressed,
    thumbsDownPressed,
    handleThumbsUpClick,
    handleThumbsDownClick,
    showDetailedFeedback,
    setShowDetailedFeedback,
    feedback,
    setFeedback,
    handleFeedbackSendClick,
  };
};
