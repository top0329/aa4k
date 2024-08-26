// src/components/feature/PromptForm/usePromptFormLogic.tsx

import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { PromptInfoListState } from '~/state/promptState';
import { SettingInfoState } from '~/state/settingInfoState';
import { SessionIdState } from "~/state/sessionIdState";
import { ChatHistoryState } from '~/state/chatHistoryState';
import { ActionTypeState } from '~/state/actionTypeState';
import { ChatHistoryItem, ErrorMessage, AppGenerationPlanningContext, AppGenerationPlanningConversation } from '~/types';
import { ErrorCode, ErrorMessage as ErrorMessageConst, InfoMessage, MessageType, ActionType } from "~/constants"
import { KintoneError } from "~/util/customErrors";
import { getApiErrorMessage } from '~/util/getErrorMessage';
import { preCheck } from '~/util/preCheck';
import { insertConversation } from "~/util/insertConversationHistory"
import { InsertConversationRequest, InsertConversationResponseBody } from "~/types/apiInterfaces"
import { appGenerationPlanning } from "~/ai/appGen/appGenerationPlanning"

type PromptFormProps = {
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  isInitVisible: boolean;
  setIsInitVisible: React.Dispatch<React.SetStateAction<boolean>>;
  aiAnswer: string,
  setAiAnswer: React.Dispatch<React.SetStateAction<string>>,
  finishAiAnswer: boolean,
  setFinishAiAnswer: React.Dispatch<React.SetStateAction<boolean>>,
  setIsShowDetailDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const usePromptFormLogic = ({
  humanMessage,
  setHumanMessage,
  setIsInitVisible,
  setAiAnswer,
  setFinishAiAnswer,
  setIsShowDetailDialogVisible,
}: PromptFormProps) => {
  const [chatHistoryItems, setChatHistory] = useAtom(ChatHistoryState);
  const [promptInfoList] = useAtom(PromptInfoListState);
  const [settingInfo,setSettingInfo] = useAtom(SettingInfoState);
  const [sessionId, setSessionId] = useAtom(SessionIdState);
  const [, setActionType] = useAtom(ActionTypeState); // AI応答のアクション種別を管理
  const [isVoiceInput, setVoiceInput] = useState(false);
  const [voiceInputVisible, setVoiceInputVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信ボタン押下の状態管理
  const [currentHumanMessage, setCurrentHumanMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // Ref
  const isVoiceInputRef = useRef<boolean>(false); // 音声入力中の判定を行いたい場所によってStateでは判定できないので、Refを使って判定する
  const isPreviousCreateAction = useRef(false); // やり取りを開始している（actionTypeがcreateになった）かどうかの判定を行う為のRef
  const initialFocusRef = useRef<HTMLDivElement>(null); // 初期表示時にダミー要素にフォーカスを当てる為のRef

  /**
   * useSpeechRecognitionフックから返されるオブジェクトのプロパティ
   * 
   * transcript: 現在の音声認識のテキスト
   * finalTranscript: 音声認識が終了した後の最終的なテキスト
   * resetTranscript: 音声認識のテキストをリセットするための関数（transcriptとfinalTranscriptがクリアされる）
   * browserSupportsSpeechRecognition: ブラウザが音声認識をサポートしているかどうかを示すブール値
   */
  const { transcript, finalTranscript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const pressCtrlEnter = e.key === 'Enter' && e.ctrlKey
    if (pressCtrlEnter && humanMessage) {
      e.preventDefault(); // 改行が挿入されないようにするデフォルトのアクション
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // イベントタイプをフォームのイベントタイプに合わせてキャスト
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

      // 初期化
      setAiAnswer("");
      setFinishAiAnswer(false);
      setIsShowDetailDialogVisible(false);

      // AI問い合わせ時に音声出力するメッセージ
      setAiAnswer(`${InfoMessage.I_MSG005}`);
      setFinishAiAnswer(true);

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
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setHumanMessage("");
      setIsSubmitting(true);
      setIsInitVisible(false);

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
            content: humanMessage,
          },
          error: errorMessage,
          conversationId: "",
        };
        setChatHistory([...chatHistoryItems, chatHistoryItem]);
        setHumanMessage("");
        setActionType(ActionType.error);
        setIsSubmitting(false);
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
        // AIメッセージオブジェクトの削除
        delete chatHistoryItem.ai;
        chatHistoryItem.error = {
          role: MessageType.error,
          content: errMsgStr,
        };
        setChatHistory([...chatHistoryItems, chatHistoryItem]);
        setHumanMessage("");
        setActionType(ActionType.error);
        setIsSubmitting(false);
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
        chatHistory: chatHistoryItems,
        context: context,
      }
      const response = await appGenerationPlanning(conversation);
      setIsCreating(response.isCreating)
      setSessionId(response.sessionId)
      setSettingInfo(response.settingInfo)

      chatHistoryItem.conversationId = conversationId;
      const { role, content } = response.message;
      const { actionType, isCreating: responseIsCreating} = response;
      setActionType(actionType);
      if (role === MessageType.ai) {
        chatHistoryItem.ai = response.message;
        let speechMessage = "";
        // actionTypeに基づいて、音声出力の内容を切り替える
        if (actionType === ActionType.create || actionType === ActionType.edit) {
          speechMessage = InfoMessage.I_MSG003;
        } else if (actionType === ActionType.other) {
          // 雑談等のパターン
          if(response.message.messageDetail){
            // messageDetail（アプリ情報）がある場合、固定文言を音声出力から除外
            speechMessage = content.replace(ErrorMessageConst.E_MSG004,"");
          }else{
            speechMessage = content;
          }
        }
        setAiAnswer(speechMessage); // 成功時に音声出力するメッセージ
        setFinishAiAnswer(true);
      } else {
        // AIメッセージオブジェクトの削除
        delete chatHistoryItem.ai;
        chatHistoryItem.error = response.message;
        setActionType(ActionType.error);
      }
      if (responseIsCreating && actionType === ActionType.create) {
        if (isPreviousCreateAction.current) {
          // 作成（create） -> 作成（create）のパターンではそれまでの会話履歴をリセットする
          setChatHistory([chatHistoryItem]);
        } else {
          // 初回の作成（create）時にフラグをオンにする
          isPreviousCreateAction.current = true;
          setChatHistory([...chatHistoryItems, chatHistoryItem]);
        }
      } else {
        setChatHistory([...chatHistoryItems, chatHistoryItem]);
      }
      setIsSubmitting(false);

    } catch (err) {
      let messageContent: string = '';
      if (err instanceof KintoneError) {
        messageContent = err.message;
      } else {
        // TODO: 「ErrorMessageConst.E_MSG001」は、暫定でエラー時の音声出力内容を設定中
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
      setChatHistory([...chatHistoryItems, chatHistoryItem]);
      setHumanMessage("");
      setActionType(ActionType.error);
      setIsSubmitting(false);
    }
  };

  const handleClearConversation = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (window.confirm(`${InfoMessage.I_MSG002}`)) {
      setActionType("");
      setHumanMessage("");
      setIsShowDetailDialogVisible(false);
      // 会話履歴をクリアする
      setChatHistory([]);
      // 初期表示フラグをオンにする
      setIsInitVisible(true);
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
    if (initialFocusRef.current) {
      // 初期表示時、ダミー要素にフォーカスし、テキストエリアにフォーカスさせない
      initialFocusRef.current.focus();
    }
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
    initialFocusRef,
  };
};
