// src/components/feature/CornerDialog/useCornerDialogLogic.tsx

import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from 'react';
// import { useUpdateEffect } from "react-use";
// import { ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants";
import { useTextSpeech } from "~/hooks/useTextSpeech";
// import { DesktopChatHistoryState, MobileChatHistoryState } from '~/state/chatHistoryState'; // TODO: Chat履歴をstateに格納
import { AppDialogVisibleState } from '~/state/appDialogVisibleState';
// import { PromptInfoListState } from '~/state/promptState';
// import { AiMessage, ChatHistory, ChatHistoryItem, ErrorMessage, MessageType } from "~/types/ai";
// import { KintoneError } from "~/util/customErrors";
// import { getApiErrorMessage } from '~/util/getErrorMessage';
// import { preCheck } from "~/util/preCheck";
// import { getPromptInfoList } from "~/util/getPrompt"

type DragPosition = { x: number; y: number };

// 起動バナーの位置を保存
const getSavedPosition = (): DragPosition | null => {
  const savedPosition = localStorage.getItem('bannerPosition');
  return savedPosition ? JSON.parse(savedPosition) : null;
};

export const useCornerDialogLogic = () => {
  // const [, setDesktopChatHistory] = useAtom(DesktopChatHistoryState);
  // const [, setPromptInfoList] = useAtom(PromptInfoListState);
  const [isBannerClicked, setIsBannerClicked] = useState<boolean>(false);
  const [isAppDialogVisible, setIsAppDialogVisible] = useAtom(AppDialogVisibleState);
  const [humanMessage, setHumanMessage] = useState("");
  // const [callbackFuncs, setCallbackFuncs] = useState<Function[] | undefined>([]);

  const [initialPosition, setInitialPosition] = useState<DragPosition>(() => {
    const savedPosition = getSavedPosition();
    return savedPosition || { x: window.innerWidth - 120, y: window.innerHeight - 120 };
  });

  const savedPosition = useMemo(() => {
    const position = localStorage.getItem('bannerPosition');
    if (position) {
      const parsedPosition = JSON.parse(position);
      const adjustedPosition = {
        x: Math.min(parsedPosition.x, window.innerWidth - 120),
        y: Math.min(parsedPosition.y, window.innerHeight - 120),
      };
      if (
        adjustedPosition.x !== parsedPosition.x ||
        adjustedPosition.y !== parsedPosition.y
      ) {
        localStorage.removeItem('bannerPosition');
        return { x: window.innerWidth - 120, y: window.innerHeight - 120 };
      }
      return adjustedPosition;
    }
    return { x: window.innerWidth - 120, y: window.innerHeight - 120 };
  }, []);

  // 音声出力
  const [aiAnswer, setAiAnswer] = useState("");
  const [finishAiAnswer, setFinishAiAnswer] = useState(false);
  const { setDisable } = useTextSpeech(
  // const { setDisable, isSpeech } = useTextSpeech(
    aiAnswer,
    setAiAnswer,
    finishAiAnswer,
  );

  // 起動バナーを押下
  const handleBannerClick = (event: React.MouseEvent<HTMLDivElement> | null) => {
    if (!event?.defaultPrevented) {
      setIsAppDialogVisible(true);
      // 二重押下防止
      setIsBannerClicked(true);
    }
  }

  // TODO: app用に調整
  // // 事前チェックを実行
  // const execPreCheck = async () => {
  //   try {
  //     const appId = kintone.app.getId();

  //     // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
  //     if (appId === null) {
  //       setIsBannerClicked(false);
  //       setDockState({
  //         dialogVisible: false,
  //         chatVisible: false,
  //         codeEditorVisible: false,
  //         spChatVisible: false,
  //       });
  //       showErrorToast(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00001}）`, ToastPosition.TopCenter);
  //       return;
  //     }

  //     // 事前チェックの呼び出し
  //     const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck(pluginId);
  //     if (resPreCheckStatus !== 200) {
  //       setIsBannerClicked(false);
  //       setDockState({
  //         dialogVisible: false,
  //         chatVisible: false,
  //         codeEditorVisible: false,
  //         spChatVisible: false,
  //       });
  //       // APIエラー時のエラーメッセージを取得
  //       const errorMessage = getApiErrorMessage(resPreCheckStatus, preCheckResult.errorCode);
  //       // APIエラーの場合、エラーメッセージ表示
  //       showErrorToast(errorMessage, ToastPosition.TopCenter);
  //       return;
  //     }

  //     setIsBannerClicked(false);
  //     setIsInitVisible(true);
  //     setIsReload(false);

  //     // プロンプト情報の取得
  //     execGetPromptInfoList();
  //   } catch (err) {
  //     let message: string = '';
  //     if (err instanceof KintoneError) {
  //       message = err.message;
  //     } else {
  //       message = `${ErrorMessageConst.E_MSG001}（${ErrorCode.E99999}）`;
  //     }
  //     setIsBannerClicked(false);
  //     setDockState({
  //       dialogVisible: false,
  //       chatVisible: false,
  //       codeEditorVisible: false,
  //       spChatVisible: false,
  //     });
  //     showErrorToast(message, ToastPosition.TopCenter);
  //   }
  // }

  // TODO: プロンプト取得
  // // プロンプト情報の取得
  // const execGetPromptInfoList = async () => {
  //   try {
  //     const { promptResult, resStatus: _resPromptStatus } = await getPromptInfoList(pluginId);

  //     const promptInfoList = promptResult.promptInfoList;
  //     setPromptInfoList(promptInfoList);
  //   } catch (err) {
  //     // 何もしない
  //   }
  // }

  // TODO: 初回表示のタイミング調整
  // useEffect(() => {
  //   if (isVisible) {
  //     // Dock初回表示の場合、事前チェックを行う
  //     execPreCheck();
  //   }
  //   // setDisable(!dockState.dialogVisible);
  // }, [isVisible]);

  //　ダイアログ表示時にバナークリック状態をリセット
  useEffect(() => {
    if (isAppDialogVisible) {
      setIsBannerClicked(false);
    }
    // ダイアログの表示状況で音声出力するか否かを制御
    setDisable(!isAppDialogVisible);
    // ダイアログを閉じると初期画面に戻る為、再度開いた際に音声が出力されないようにする
    setAiAnswer("");
  }, [isAppDialogVisible]);

  // 起動バナーの位置を保存
  const savePosition = (position: DragPosition) => {
    localStorage.setItem('bannerPosition', JSON.stringify(position));
  };

  useEffect(() => {
    const savedPosition = getSavedPosition();
    if (savedPosition) {
      setInitialPosition(savedPosition);
    } else {
      savePosition(initialPosition);
    }
  }, [getSavedPosition]);

  // TODO: app用に調整
  // const execCallbacks = () => {
  //   callbackFuncs?.forEach((fn) => fn());
  // };

  // // JS生成AI機能の呼び出し後、音声出力が完了したのを確認したのちにJS生成AI機能からのcallbacksを実行する
  // useUpdateEffect(() => {
  //   if (AppDialogVisibleState && !isSpeech) {
  //     execCallbacks();
  //   }
  // }, [AppDialogVisibleState, isSpeech]);


  return {
    isAppDialogVisible,
    setIsAppDialogVisible,
    handleBannerClick,
    isBannerClicked,
    initialPosition,
    setInitialPosition,
    savePosition,
    savedPosition,
    humanMessage,
    setHumanMessage,
    // setCallbackFuncs,
    // execCallbacks,
    aiAnswer,
    setAiAnswer,
    finishAiAnswer,
    setFinishAiAnswer
  };
};
