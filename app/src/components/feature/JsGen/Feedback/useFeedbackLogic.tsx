// src/components/feature/JsGen/Feedback/useFeedbackLogic.tsx
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useToast } from "~/components/ui/Origin/ErrorToast/ErrorToastProvider";
import { ErrorCode, ErrorMessage, UserRating } from '~/constants';
import { useChatHistory } from "~/hooks/useChatHistory";
import { PluginIdState } from "~/state/pluginIdState";
import { ViewModeState } from "~/state/viewModeState";
import { ChatHistoryItem } from "~/types/ai";
import { KintoneProxyResponse, KintoneProxyResponseBody, KintoneRestAPiError } from "~/types/apiResponse";
import { KintoneError } from "~/util/customErrors";
import { getApiErrorMessage } from '~/util/getErrorMessage';

export const useFeedbackLogic = (chatHistoryItem: ChatHistoryItem) => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const { chatHistoryItems, setChatHistory } = useChatHistory(isPcViewMode);
  const [thumbsUpPressed, setThumbsUpPressed] = useState(false);
  const [thumbsDownPressed, setThumbsDownPressed] = useState(false);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [activeConversationId,] = useState<string>(chatHistoryItem.conversationId);
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
      `${import.meta.env.VITE_API_ENDPOINT}/plugin/js_gen/conversation_history/update-user-rating`,
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
    try {
      const resUpdateUserRating = await kintone.plugin.app.proxy(
        pluginId,
        `${import.meta.env.VITE_API_ENDPOINT}/plugin/js_gen/conversation_history/update-user-rating`,
        "POST",
        {},
        { conversationId: activeConversationId, userRating: userRating },
      ).catch((resBody: string) => {
        const e = JSON.parse(resBody) as KintoneRestAPiError;
        throw new KintoneError(`${ErrorMessage.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`);
      }) as KintoneProxyResponse;
      const [resBody, resStatus] = resUpdateUserRating;
      const resBodyUpdateUserRating = JSON.parse(resBody) as KintoneProxyResponseBody;
      if (resStatus !== 200) {
        // APIエラー時のエラーメッセージを取得
        const errorMessage = getApiErrorMessage(resStatus, resBodyUpdateUserRating.errorCode);
        // トーストでエラーメッセージ表示
        showToast(errorMessage, 3000, true);
        return false;
      }
  
      updateConversationRating(userRating);
      return true;
    } catch (err) {
      let message: string = '';
      if (err instanceof KintoneError) {
        message = err.message;
      } else {
        message = `${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`;
      }
      // トーストでエラーメッセージ表示
      showToast(message, 3000, true);
      return false;
    }
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
