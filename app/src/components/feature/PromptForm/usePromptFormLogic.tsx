// src/components/forms/Form/FormLogic.tsx
import { useAtom } from 'jotai';
import { useState } from 'react';
import { appCreateJs } from '~/ai/appCreateJs';
import { DeviceDiv, ErrorCode, ErrorMessage as ErrorMessageConst } from '~/constants';
import { ChatHistoryItem, ErrorMessage, MessageType } from '~/types/ai';
import { KintoneProxyResponse, InsertConversationResponseBody } from '~/types/apiResponse';
import { preCheck } from '~/util/preCheck';
import { ChatHistoryState, InTypeWriteState } from '../CornerDialog/CornerDialogState';

export const usePromptFormLogic = () => {
  const [chatHistoryItems, setChatHistory] = useAtom(ChatHistoryState);
  const [humanMessage, setHumanMessage] = useState('');
  const [, setInTypeWrite] = useAtom(InTypeWriteState);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const appId = kintone.app.getId();
    const userId = kintone.getLoginUser().id;
    const isGuest = kintone.getLoginUser().isGuest;

    // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
    if (appId === null) {
      const errorMessage: ErrorMessage = {
        role: MessageType.error,
        content: `${ErrorMessageConst.UnavailableScreen}`
      };
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: humanMessage,
        },
        error: errorMessage,
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
        content: preCheckResult.errorCode === ErrorCode.A02002 ? `${ErrorMessageConst.unsupportedVersion}（${preCheckResult.errorCode}）`
          : `${ErrorMessageConst.currentlyUnavailable}（${preCheckResult.errorCode}）`
      };
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: humanMessage,
        },
        error: errorMessage,
      };
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setHumanMessage("");
      setInTypeWrite(true);
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
      { appId: appId, userId: userId, deviceDiv: DeviceDiv.desktop, messageType: MessageType.human, message: humanMessage },
    ) as KintoneProxyResponse;
    const [resBody, resInsertConversationStatus] = resInsertConversation;
    const resJsonInsertConversation = JSON.parse(resBody) as InsertConversationResponseBody;
    if (resInsertConversationStatus !== 200) {
      // AIメッセージオブジェクトの削除
      delete chatHistoryItem.ai;
      chatHistoryItem.error = {
        role: MessageType.error,
        content: `${ErrorMessageConst.currentlyUnavailable}（${resJsonInsertConversation.errorCode}）`,
      };
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setInTypeWrite(true);
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
          deviceDiv: DeviceDiv.desktop,
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

    await new Promise((resolve) => setTimeout(resolve, 5000));  // TODO: ストリーミング・音声出力が完了したらcallbacksを動かすようにしたいが、暫定的にtimeoutで代用
    callbacks?.forEach((fn) => fn());
  };

  return {
    humanMessage,
    setHumanMessage,
    handleSubmit
  };
};
