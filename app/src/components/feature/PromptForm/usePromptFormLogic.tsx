// src/components/feature/PromptForm/usePromptFormLogic.tsx
import { useAtom } from 'jotai';
import { appCreateJs } from '~/ai/appCreateJs';
import { DeviceDiv, ErrorCode, ErrorMessage as ErrorMessageConst } from '~/constants';
import { ChatHistoryItem, ErrorMessage, MessageType } from '~/types/ai';
import { InsertConversationResponseBody, KintoneProxyResponse } from '~/types/apiResponse';
import { preCheck } from '~/util/preCheck';
import { InTypeWriteState, DesktopChatHistoryState, MobileChatHistoryState, ViewModeState, IsSubmittingState } from '../CornerDialog/CornerDialogState';
import { humanMessageState, voiceInputState } from './PromptFormState';

export const usePromptFormLogic = () => {
  const [isPcViewMode, setIsPcViewMode] = useAtom(ViewModeState);
  const [chatHistoryItems, setChatHistory] = useAtom(isPcViewMode ? DesktopChatHistoryState : MobileChatHistoryState);
  const [humanMessage, setHumanMessage] = useAtom(humanMessageState);
  const [isSubmitting, setIsSubmitting] = useAtom(IsSubmittingState);
  const [, setInTypeWrite] = useAtom(InTypeWriteState);
  const [isVoiceInput,
    setVoiceInput] = useAtom(voiceInputState);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const pressShiftEnter = e.key === 'Enter' && e.shiftKey
    if (pressShiftEnter) {
      e.preventDefault(); // Prevent the default action to avoid newline insertion
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // Cast the event type to match the form event type
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const appId = kintone.app.getId();
    const userId = kintone.getLoginUser().id;
    const isGuest = kintone.getLoginUser().isGuest;
    const deviceDiv = isPcViewMode ? DeviceDiv.desktop : DeviceDiv.mobile;

    // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
    if (appId === null) {
      const errorMessage: ErrorMessage = {
        role: MessageType.error,
        content: `${ErrorMessageConst.E_MSG003}（${ErrorCode.E00001}）`
      };
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: humanMessage,
        },
        error: errorMessage,
        conversationId: "",
      };
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setHumanMessage("");
      setInTypeWrite(true);
      return;
    }

    // 事前チェックの呼び出し
    const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck();
    if (resPreCheckStatus !== 200) {
      const errorMessage: ErrorMessage = {
        role: MessageType.error,
        content: preCheckResult.errorCode === ErrorCode.A02002 ? `${ErrorMessageConst.E_MSG002}（${preCheckResult.errorCode}）`
          : `${ErrorMessageConst.E_MSG001}（${preCheckResult.errorCode}）`
      };
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: humanMessage,
        },
        error: errorMessage,
        conversationId: "",
      };
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setHumanMessage("");
      setInTypeWrite(true);
      setIsSubmitting(false);
      return;
    }
    const contractStatus = preCheckResult.contractStatus;
    const systemSettings = preCheckResult.systemSettings;

    const chatHistoryItem: ChatHistoryItem = {
      human: {
        role: MessageType.human,
        content: humanMessage,
      },
      ai: {
        role: MessageType.ai,
        content: "",
        comment: "",
      },
      conversationId: "",
    };
    setChatHistory([...chatHistoryItems, chatHistoryItem]);
    setHumanMessage("");
    setInTypeWrite(true);

    // ユーザ発話の登録
    // TODO: 「kintone.plugin.app.proxy」でAPI連携する必要がある（プラグイン開発としての準備が整っていないため暫定的に「kintone.proxy」を使用
    // const pluginId = kintone.$PLUGIN_ID;
    // const pluginId = "1234567890";
    // const insertConversation = await kintone.plugin.app.proxy(pluginId, `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/insert`,
    //   "POST",
    //   { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
    //   { appId: appId, userId: userId, deviceDiv: deviceDiv, messageDiv: "user", message: userMessage },
    // );
    const resInsertConversation = await kintone.proxy(
      `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/insert`,
      "POST",
      { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
      { appId: appId, userId: userId, deviceDiv: deviceDiv, messageType: MessageType.human, message: humanMessage },
    ) as KintoneProxyResponse;
    const [resBody, resInsertConversationStatus] = resInsertConversation;
    const resJsonInsertConversation = JSON.parse(resBody) as InsertConversationResponseBody;
    if (resInsertConversationStatus !== 200) {
      // AIメッセージオブジェクトの削除
      delete chatHistoryItem.ai;
      chatHistoryItem.error = {
        role: MessageType.error,
        content: `${ErrorMessageConst.E_MSG001}（${resJsonInsertConversation.errorCode}）`,
      };
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setInTypeWrite(true);
      setIsSubmitting(false);
      return;
    }
    const conversationId = resJsonInsertConversation.conversationId;

    // AI機能（kintoneカスタマイズJavascript生成）の呼び出し
    const { message, callbacks } = await appCreateJs(
      {
        message: {
          role: MessageType.human,
          content: humanMessage,
        },
        // chatHistory: chatHistoryItems,
        chatHistory: [],
        context: {
          appId: appId,
          userId: userId,
          conversationId: conversationId,
          deviceDiv: deviceDiv,
          contractStatus: contractStatus,
          isGuestSpace: isGuest,
          systemSettings: systemSettings,
        },
      }
    )
    chatHistoryItem.conversationId = conversationId;
    if (message.role === MessageType.ai) {
      chatHistoryItem.ai = message;
    } else {
      // AIメッセージオブジェクトの削除
      delete chatHistoryItem.ai;
      chatHistoryItem.error = message;
    }
    setChatHistory([...chatHistoryItems, chatHistoryItem]);
    setIsSubmitting(false);

    await new Promise((resolve) => setTimeout(resolve, 5000));  // TODO: ストリーミング・音声出力が完了したらcallbacksを動かすようにしたいが、暫定的にtimeoutで代用
    callbacks?.forEach((fn) => fn());
  };

  return {
    handleSubmit,
    humanMessage,
    setHumanMessage,
    isPcViewMode,
    setIsPcViewMode,
    isVoiceInput,
    setVoiceInput,
    handleKeyDown,
    isSubmitting,
  };
};
