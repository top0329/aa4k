// src/components/feature/PromptForm/usePromptFormLogic.tsx

import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
// import { appCreateJs } from '~/ai/appCreateJs';
// import { DeviceDiv, ErrorCode, ErrorMessage as ErrorMessageConst, InfoMessage } from '~/constants';
// import { DesktopChatHistoryState, MobileChatHistoryState } from '~/state/chatHistoryState';
import { PromptInfoListState } from '~/state/promptState';
import { SettingInfoState } from '~/state/settingInfoState';
import { SessionIdState } from "~/state/sessionIdState";
import { ChatHistoryItem, /*ErrorMessage,*/AppGenerationPlanningContext, AppGenerationPlanningConversation } from '~/types';
import { MessageType } from "~/constants"
// import { InsertConversationResponseBody, KintoneProxyResponse, KintoneProxyResponseBody, KintoneRestAPiError } from '~/types/apiResponse';
// import { KintoneError } from "~/util/customErrors";
import { getApiErrorMessage } from '~/util/getErrorMessage';
import { preCheck } from '~/util/preCheck';
import { insertConversation } from "~/util/insertConversationHistory"
import { InsertConversationRequest, InsertConversationResponseBody } from "~/types/apiInterfaces"
import { appGenerationPlanning } from "~/ai/appGen/appGenerationPlanning"


type PromptFormProps = {
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  // setCallbackFuncs: React.Dispatch<React.SetStateAction<Function[] | undefined>>;
  aiAnswerRef: React.MutableRefObject<string>;
  finishAiAnswerRef: React.MutableRefObject<boolean>;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  isInitVisible: boolean;
  setIsInitVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const usePromptFormLogic = ({
  humanMessage,
  setHumanMessage,
  // setCallbackFuncs,
  aiAnswerRef,
  finishAiAnswerRef,
  // scrollRef,
  // isInitVisible,
  setIsInitVisible,
}: PromptFormProps) => {
  // const [chatHistoryItems, setChatHistory] = useAtom(isPcViewMode ? DesktopChatHistoryState : MobileChatHistoryState);
  const [isVoiceInput, setVoiceInput] = useState(false);
  const [voiceInputVisible, setVoiceInputVisible] = useState(true);
  // 送信ボタン押下の状態管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptInfoList] = useAtom(PromptInfoListState);
  const [settingInfo] = useAtom(SettingInfoState);
  const [sessionId, setSessionId] = useAtom(SessionIdState);
  const [currentHumanMessage, setCurrentHumanMessage] = useState("");
  // Ref
  const isVoiceInputRef = useRef<boolean>(false); // 音声入力中の判定を行いたい場所によってStateでは判定できないので、Refを使って判定する
  const [isCreating, setIsCreating] = useState(false);
  /* 
    useSpeechRecognitionフックから返されるオブジェクトのプロパティ

    transcript: 現在の音声認識のテキスト
    finalTranscript: 音声認識が終了した後の最終的なテキスト
    resetTranscript: 音声認識のテキストをリセットするための関数（transcriptとfinalTranscriptがクリアされる）
    browserSupportsSpeechRecognition: ブラウザが音声認識をサポートしているかどうかを示すブール値
  */
  const { transcript, finalTranscript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const pressCtrlEnter = e.key === 'Enter' && e.ctrlKey
    if (pressCtrlEnter && humanMessage) {
      e.preventDefault(); // 改行が挿入されないようにするデフォルトのアクション
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // イベントタイプをフォームのイベントタイプに合わせてキャスト
    }
  };

  // TODO: 送信ボタンの処理
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

      console.log("test", conversationId, currentHumanMessage);

      const userId = kintone.getLoginUser().id;

      const chatHistoryItem: ChatHistoryItem = {
        human: {
          role: MessageType.human,
          content: humanMessage,
        },
        ai: {
          role: MessageType.ai,
          content: "",
          messageDetail: "",
        },
        conversationId: "",
      };
      // setChatHistory([...chatHistoryItems, chatHistoryItem]);
      //     setHumanMessage("");
      //     setInTypeWrite(true);
      setIsSubmitting(true);
      setIsInitVisible(false);
      //     startLoading?.();
      //     if (scrollRef && scrollRef.current) {
      //       // ローディング表示が表示されるまでの時間を考慮して100ミリ秒後に 一番下にスクロール
      //       await new Promise((resolve) => setTimeout(resolve, 100));
      //       scrollRef.current.scrollIntoView();
      //     }


      // 事前チェックの呼び出し
      const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck();
      if (resPreCheckStatus !== 200) {
        // APIエラー時のエラーメッセージを取得
        const errMsgStr = getApiErrorMessage(resPreCheckStatus, preCheckResult.errorCode);
        console.log("errMsgStr:", errMsgStr)

        // const errorMessage: ErrorMessage = {
        //   role: MessageType.error,
        //   content: errMsgStr
        // };
        // const chatHistoryItem: ChatHistoryItem = {
        //   human: {
        //     role: MessageType.human,
        //     content: humanMessage,
        //   },
        //   error: errorMessage,
        //   conversationId: "",
        // };
        // aiAnswerRef.current = ErrorMessageConst.E_MSG004;   // 失敗時に音声出力するメッセージ
        // finishAiAnswerRef.current = true;
        // setChatHistory([...chatHistoryItems, chatHistoryItem]);
        // setHumanMessage("");
        // setInTypeWrite(true);
        // setIsSubmitting(false);
        // stopLoading?.();
        return;
      }
      const contractStatus = preCheckResult.contractStatus;

      // ユーザ発話の登録
      const reqConversation: InsertConversationRequest = {
        userId: userId,
        sessionId: sessionId,
        userMessage: humanMessage,
      };
      const resInsertConversation = await insertConversation(reqConversation);
      const [resBody, resInsertConversationStatus] = resInsertConversation;
      const resJsonInsertConversation = JSON.parse(resBody) as InsertConversationResponseBody;
      if (resInsertConversationStatus !== 200) {
        // APIエラー時のエラーメッセージを取得
        const errMsgStr = getApiErrorMessage(resInsertConversationStatus, resJsonInsertConversation.errorCode);
        console.log("errMsgStr:", errMsgStr)
        // // AIメッセージオブジェクトの削除
        // delete chatHistoryItem.ai;
        // chatHistoryItem.error = {
        //   role: MessageType.error,
        //   content: errMsgStr,
        // };
        // aiAnswerRef.current = ErrorMessageConst.E_MSG004;   // 失敗時に音声出力するメッセージ
        // finishAiAnswerRef.current = true;
        // setChatHistory([...chatHistoryItems, chatHistoryItem]);
        // setInTypeWrite(true);
        // setIsSubmitting(false);
        // stopLoading?.();
        return;
      }
      conversationId = resJsonInsertConversation.conversationId;

      // AI機能（kintoneカスタマイズJavascript生成）の呼び出し
      const context: AppGenerationPlanningContext = {
        userId: userId,
        conversationId: conversationId,
        sessionId: sessionId,
        isCreating: isCreating,
        settingInfo: settingInfo,
        contractStatus: contractStatus,
        promptInfoList: promptInfoList
      }
      const conversation: AppGenerationPlanningConversation = {
        message: chatHistoryItem.human,
        chatHistory: [],// chatHistoryItems, TODO: chatHistoryの設定
        context: context,
      }
      const response = await appGenerationPlanning(conversation);
      setIsCreating(response.isCreating)
      setSessionId(response.sessionId)

      //     setCallbackFuncs(callbacks);

      //     stopLoading?.();

      //     chatHistoryItem.conversationId = conversationId;
      //     if (message.role === MessageType.ai) {
      //       chatHistoryItem.ai = message;
      //       const speechMessage = (callbacks && callbacks.length) ? InfoMessage.I_MSG004 : message.content;
      //       aiAnswerRef.current = speechMessage;   // 成功時に音声出力するメッセージ
      //     } else {
      //       // AIメッセージオブジェクトの削除
      //       delete chatHistoryItem.ai;
      //       chatHistoryItem.error = message;
      //       aiAnswerRef.current = ErrorMessageConst.E_MSG004;   // 失敗時に音声出力するメッセージ
      //     }
      //     finishAiAnswerRef.current = true;
      //     setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setIsSubmitting(false);

    } catch (err) {
      let messageContent: string = '';
      console.log("test", messageContent);
      //     if (err instanceof KintoneError) {
      //       messageContent = err.message;
      //     } else {
      //       messageContent = `${ErrorMessageConst.E_MSG001}（${ErrorCode.E99999}）`;
      //     }
      //     const errorMessage: ErrorMessage = {
      //       role: MessageType.error,
      //       content: messageContent
      //     };
      //     const chatHistoryItem: ChatHistoryItem = {
      //       human: {
      //         role: MessageType.human,
      //         content: humanMessage,
      //       },
      //       error: errorMessage,
      //       conversationId: conversationId,
      //     };
      //     aiAnswerRef.current = ErrorMessageConst.E_MSG004;   // 失敗時に音声出力するメッセージ
      //     finishAiAnswerRef.current = true;
      //     setChatHistory([...chatHistoryItems, chatHistoryItem]);
      //     setHumanMessage("");
      //     setInTypeWrite(true);
      setIsSubmitting(false);
      //     stopLoading?.();
    }
  };

  // TODO：新しく会話を始める処理
  const handleClearConversation = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      console.log("新しく会話を始める");
      //     if (window.confirm('これまでの会話の表示をクリアして、新しい会話を始めますが、よろしいですか？')) {
      //       const appId = kintone.app.getId();
      //       const userId = kintone.getLoginUser().id;
      //       const deviceDiv = isPcViewMode ? DeviceDiv.desktop : DeviceDiv.mobile;

      //       const resClearConversation = await kintone.plugin.app.proxy(
      //         pluginId,
      //         `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/clear`,
      //         "POST",
      //         {},
      //         { appId: appId, userId: userId, deviceDiv: deviceDiv },
      //       ).catch((resBody: string) => {
      //         const e = JSON.parse(resBody) as KintoneRestAPiError;
      //         throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`);
      //       }) as KintoneProxyResponse;
      //       const [resBody, resStatus] = resClearConversation;
      //       const resBodyClearConversation = JSON.parse(resBody) as KintoneProxyResponseBody;
      //       if (resStatus !== 200) {
      //         // APIエラー時のエラーメッセージを取得
      //         const errorMessage = getApiErrorMessage(resStatus, resBodyClearConversation.errorCode);
      //         // トーストでエラーメッセージ表示
      //         showToast(errorMessage, 0, false);
      //         return;
      //       }
      //       // 画面上の会話履歴をクリア
      //       setChatHistory([]);
      //     }
    } catch (err) {
      //     let message: string = '';
      //     if (err instanceof KintoneError) {
      //       message = err.message;
      //     } else {
      //       message = `${ErrorMessageConst.E_MSG001}（${ErrorCode.E99999}）`;
      //     }
      //     // トーストでエラーメッセージ表示
      //     showToast(message, 0, false);
      //     return;
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
    isVoiceInput,
    setVoiceInput,
    handleKeyDown,
    handleVoiceInput,
    handleHumanMessageChange,
    handleClearConversation,
    isSubmitting,
    voiceInputVisible,
  };
};
