// src/components/feature/JsGen/PromptForm/usePromptFormLogic.tsx
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { appCreateJs } from '~/ai/appCreateJs';
import { useToast } from '~/components/ui/Origin/ErrorToast/ErrorToastProvider';
import { DockDisplayTypes, DeviceDiv, ErrorCode, ErrorMessage as ErrorMessageConst, InfoMessage } from '~/constants';
import useToggleDockItem from '~/hooks/useToggleDockItem';
import { DesktopChatHistoryState, MobileChatHistoryState } from '~/state/chatHistoryState';
import { DesktopIsChangeCodeState, MobileIsChangeCodeState } from '~/state/codeActionState';
import { DockItemVisibleState } from '~/state/dockItemState';
import { InTypeWriteState } from '~/state/inTypeWriteState';
import { PluginIdState } from '~/state/pluginIdState';
import { ReloadState } from "~/state/reloadState";
import { ViewModeState } from '~/state/viewModeState';
import { PromptInfoListState } from '~/state/promptState';
import { ChatHistoryItem, ErrorMessage, MessageType } from '~/types/ai';
import { InsertConversationResponseBody, KintoneProxyResponse, KintoneProxyResponseBody, KintoneRestAPiError } from '~/types/apiResponse';
import { KintoneError } from "~/util/customErrors";
import { getApiErrorMessage } from '~/util/getErrorMessage';
import { preCheck } from '~/util/preCheck';
import { ActiveFunctionState } from '~/state/activeFunctionState';

type PromptFormProps = {
  startLoading?: () => void;
  stopLoading?: () => void;
  isChangeCodeRef?: React.MutableRefObject<boolean>;
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  setCallbackFuncs: React.Dispatch<React.SetStateAction<Function[] | undefined>>;
  aiAnswerRef: React.MutableRefObject<string>;
  finishAiAnswerRef: React.MutableRefObject<boolean>;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const usePromptFormLogic = ({
  humanMessage,
  setHumanMessage,
  startLoading,
  stopLoading,
  isChangeCodeRef,
  setCallbackFuncs,
  aiAnswerRef,
  finishAiAnswerRef,
  scrollRef,
}: PromptFormProps) => {
  const [isPcViewMode, setIsPcViewMode] = useAtom(ViewModeState);
  const [chatHistoryItems, setChatHistory] = useAtom(isPcViewMode ? DesktopChatHistoryState : MobileChatHistoryState);
  const [dockState] = useAtom(DockItemVisibleState);
  const {
    toggleItemVisibility
  } = useToggleDockItem();
  const [isVoiceInput,
    setVoiceInput] = useState(false);
  const [voiceInputVisible, setVoiceInputVisible] = useState(true);
  const [isDesktopChangeCode] = useAtom(DesktopIsChangeCodeState);
  const [isMobileChangeCode] = useAtom(MobileIsChangeCodeState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setInTypeWrite] = useAtom(InTypeWriteState);
  const [pluginId] = useAtom(PluginIdState);
  const [, setIsReload] = useAtom(ReloadState);
  const [promptInfoList] = useAtom(PromptInfoListState);
  const [activeFunctionState, setActiveFunctionState] = useAtom(ActiveFunctionState);
  const { jsGen } = DockDisplayTypes;
  const [currentHumanMessage, setCurrentHumanMessage] = useState("");
  // Ref
  const isVoiceInputRef = useRef<boolean>(false); // 音声入力中の判定を行いたい場所によってStateでは判定できないので、Refを使って判定する

  const { showToast } = useToast();

  const toggleChatVisibilityHandler = () => {
    setIsPcViewMode(!isPcViewMode)
    dockState.chatVisible ? toggleItemVisibility('spChatVisible') : toggleItemVisibility('chatVisible');
  }

  const { transcript, finalTranscript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const pressCtrlEnter = e.key === 'Enter' && e.ctrlKey
    if (pressCtrlEnter && humanMessage) {
      e.preventDefault(); // Prevent the default action to avoid newline insertion
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // Cast the event type to match the form event type
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    let conversationId: string = "";
    try {
      e.preventDefault();

      if (isVoiceInput) {
        // 音声入力中の場合は、音声識別を停止
        await SpeechRecognition.stopListening();
        resetTranscript();
        isVoiceInputRef.current = false;
        setVoiceInput(false);
      }

      aiAnswerRef.current = '';
      finishAiAnswerRef.current = false;
      setActiveFunctionState(jsGen);

      const appId = kintone.app.getId();
      const userId = kintone.getLoginUser().id;
      const isGuest = kintone.getLoginUser().isGuest;
      const deviceDiv = isPcViewMode ? DeviceDiv.desktop : DeviceDiv.mobile;
      const isChangeCode = isDesktopChangeCode || isMobileChangeCode ? true : false;

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
      setIsSubmitting(true);
      startLoading?.();
      if (scrollRef && scrollRef.current) {
        // ローディング表示が表示されるまでの時間を考慮して100ミリ秒後に 一番下にスクロール
        await new Promise((resolve) => setTimeout(resolve, 100));
        scrollRef.current.scrollIntoView();
      }

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
        aiAnswerRef.current = ErrorMessageConst.E_MSG004;   // 失敗時に音声出力するメッセージ
        finishAiAnswerRef.current = true;
        setChatHistory([...chatHistoryItems, chatHistoryItem]);
        setHumanMessage("");
        setInTypeWrite(true);
        setIsSubmitting(false);
        stopLoading?.();
        setActiveFunctionState(null);
        return;
      }

      // 事前チェックの呼び出し
      const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck(pluginId);
      if (resPreCheckStatus !== 200) {
        // APIエラー時のエラーメッセージを取得
        const errMsgStr = getApiErrorMessage(resPreCheckStatus, preCheckResult.errorCode);

        const errorMessage: ErrorMessage = {
          role: MessageType.error,
          content: errMsgStr
        };
        const chatHistoryItem: ChatHistoryItem = {
          human: {
            role: MessageType.human,
            content: humanMessage,
          },
          error: errorMessage,
          conversationId: "",
        };
        aiAnswerRef.current = ErrorMessageConst.E_MSG004;   // 失敗時に音声出力するメッセージ
        finishAiAnswerRef.current = true;
        setChatHistory([...chatHistoryItems, chatHistoryItem]);
        setHumanMessage("");
        setInTypeWrite(true);
        setIsSubmitting(false);
        stopLoading?.();
        setActiveFunctionState(null);
        return;
      }
      const contractStatus = preCheckResult.contractStatus;
      const systemSettings = preCheckResult.systemSettings;

      // ユーザ発話の登録
      const resInsertConversation = await kintone.plugin.app.proxy(
        pluginId,
        `${import.meta.env.VITE_API_ENDPOINT}/plugin/js_gen/conversation_history/insert`,
        "POST",
        {},
        { appId: appId, userId: userId, deviceDiv: deviceDiv, messageType: MessageType.human, message: humanMessage },
      ) as KintoneProxyResponse;
      const [resBody, resInsertConversationStatus] = resInsertConversation;
      const resJsonInsertConversation = JSON.parse(resBody) as InsertConversationResponseBody;
      if (resInsertConversationStatus !== 200) {
        // APIエラー時のエラーメッセージを取得
        const errMsgStr = getApiErrorMessage(resInsertConversationStatus, resJsonInsertConversation.errorCode);

        // AIメッセージオブジェクトの削除
        delete chatHistoryItem.ai;
        chatHistoryItem.error = {
          role: MessageType.error,
          content: errMsgStr,
        };
        aiAnswerRef.current = ErrorMessageConst.E_MSG004;   // 失敗時に音声出力するメッセージ
        finishAiAnswerRef.current = true;
        setChatHistory([...chatHistoryItems, chatHistoryItem]);
        setInTypeWrite(true);
        setIsSubmitting(false);
        stopLoading?.();
        setActiveFunctionState(null);
        return;
      }
      conversationId = resJsonInsertConversation.conversationId;

      // AI機能（kintoneカスタマイズJavascript生成）の呼び出し
      const { message, callbacks } = await appCreateJs(
        {
          message: {
            role: MessageType.human,
            content: humanMessage,
          },
          chatHistory: chatHistoryItems,
          context: {
            appId: appId,
            userId: userId,
            conversationId: conversationId,
            deviceDiv: deviceDiv,
            contractStatus: contractStatus,
            isGuestSpace: isGuest,
            systemSettings: systemSettings,
            pluginId: pluginId,
            promptInfoList: promptInfoList
          },
        },
        isChangeCode,
        setIsReload,
        isChangeCodeRef,
      );
      setCallbackFuncs(callbacks);

      stopLoading?.();

      chatHistoryItem.conversationId = conversationId;
      if (message.role === MessageType.ai) {
        chatHistoryItem.ai = message;
        const speechMessage = (callbacks && callbacks.length) ? InfoMessage.I_MSG004 : message.content;
        aiAnswerRef.current = speechMessage;   // 成功時に音声出力するメッセージ
      } else {
        // AIメッセージオブジェクトの削除
        delete chatHistoryItem.ai;
        chatHistoryItem.error = message;
        aiAnswerRef.current = ErrorMessageConst.E_MSG004;   // 失敗時に音声出力するメッセージ
      }
      finishAiAnswerRef.current = true;
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setIsSubmitting(false);
      setActiveFunctionState(null);

    } catch (err) {
      let messageContent: string = '';
      if (err instanceof KintoneError) {
        messageContent = err.message;
      } else {
        messageContent = `${ErrorMessageConst.E_MSG001}（${ErrorCode.E99999}）`;
      }
      const errorMessage: ErrorMessage = {
        role: MessageType.error,
        content: messageContent
      };
      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: humanMessage,
        },
        error: errorMessage,
        conversationId: conversationId,
      };
      aiAnswerRef.current = ErrorMessageConst.E_MSG004;   // 失敗時に音声出力するメッセージ
      finishAiAnswerRef.current = true;
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setHumanMessage("");
      setInTypeWrite(true);
      setIsSubmitting(false);
      stopLoading?.();
      setActiveFunctionState(null);
    }
  };

  // 会話履歴一覧をクリア
  const handleClearConversation = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      if (window.confirm('これまでの会話の表示をクリアして、新しい会話を始めますが、よろしいですか？')) {
        const appId = kintone.app.getId();
        const userId = kintone.getLoginUser().id;
        const deviceDiv = isPcViewMode ? DeviceDiv.desktop : DeviceDiv.mobile;

        const resClearConversation = await kintone.plugin.app.proxy(
          pluginId,
          `${import.meta.env.VITE_API_ENDPOINT}/plugin/js_gen/conversation_history/clear`,
          "POST",
          {},
          { appId: appId, userId: userId, deviceDiv: deviceDiv },
        ).catch((resBody: string) => {
          const e = JSON.parse(resBody) as KintoneRestAPiError;
          throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`);
        }) as KintoneProxyResponse;
        const [resBody, resStatus] = resClearConversation;
        const resBodyClearConversation = JSON.parse(resBody) as KintoneProxyResponseBody;
        if (resStatus !== 200) {
          // APIエラー時のエラーメッセージを取得
          const errorMessage = getApiErrorMessage(resStatus, resBodyClearConversation.errorCode);
          // トーストでエラーメッセージ表示
          showToast(errorMessage, 0, false);
          return;
        }
        // 画面上の会話履歴をクリア
        setChatHistory([]);
      }
    } catch (err) {
      let message: string = '';
      if (err instanceof KintoneError) {
        message = err.message;
      } else {
        message = `${ErrorMessageConst.E_MSG001}（${ErrorCode.E99999}）`;
      }
      // トーストでエラーメッセージ表示
      showToast(message, 0, false);
      return;
    }
  }

  const handleVoiceInput = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isVoiceInput) {
      // 音声識別を停止
      await SpeechRecognition.stopListening();
      resetTranscript();
    } else {
      // 常時音声識別状態で開始
      SpeechRecognition.startListening({ continuous: true, language: "ja" });
      // 現在のテキストエリアの文字列を保存
      setCurrentHumanMessage(humanMessage);
    }
    isVoiceInputRef.current = !isVoiceInput;
    setVoiceInput(!isVoiceInput);
  }

  const handleHumanMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHumanMessage(e.target.value);
    // 現在のテキストエリアの文字列を保存
    setCurrentHumanMessage(e.target.value);
  }

  useEffect(() => {
    const focusHandler = () => {
      if (isVoiceInputRef.current) {
        // ウィンドウ・タブがアクティブ かつ 音声入力中の場合、常時音声識別状態で開始
        SpeechRecognition.startListening({ continuous: true, language: "ja" });
      }
    };
    const blurHandler = () => {
      if (isVoiceInputRef.current) {
        // ウィンドウ・タブが非アクティブ  かつ 音声入力中の場合、音声識別を停止
        SpeechRecognition.stopListening();
      }
    };
    window.addEventListener("focus", focusHandler, false);
    window.addEventListener("blur", blurHandler, false);

    if (!browserSupportsSpeechRecognition) {
      // Web Speech APIがサポートされていない場合は、音声マイクを非表示
      setVoiceInputVisible(false);
    }

    return () => {
      if (isVoiceInputRef.current) {
        // 音声入力中の場合は、音声識別を停止
        SpeechRecognition.stopListening();
        isVoiceInputRef.current = false;
        setVoiceInput(false);
        resetTranscript();
      }
      window.removeEventListener("focus", focusHandler, false);
      window.removeEventListener("blur", blurHandler, false);
    };
  }, []);

  useEffect(() => {
    if (isVoiceInput && transcript) {
      // 音声入力中の内容をテキストエリアにリアルタイム反映
      setHumanMessage(currentHumanMessage + transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (isVoiceInput && finalTranscript) {
      // 現在のテキストエリアの文字列を保存
      setCurrentHumanMessage(currentHumanMessage + finalTranscript);
      // 音声入力確定後の内容をリセット
      resetTranscript();
    }
  }, [finalTranscript]);

  return {
    handleSubmit,
    humanMessage,
    setHumanMessage,
    isPcViewMode,
    setIsPcViewMode,
    isVoiceInput,
    setVoiceInput,
    handleKeyDown,
    handleVoiceInput,
    handleHumanMessageChange,
    handleClearConversation,
    isSubmitting,
    voiceInputVisible,
    toggleChatVisibilityHandler,
    activeFunctionState,
  };
};
