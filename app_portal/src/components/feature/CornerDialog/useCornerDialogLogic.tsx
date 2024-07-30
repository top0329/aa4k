// src/components/feature/CornerDialog/useCornerDialogLogic.tsx

import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from 'react';
import { useUpdateEffect } from "react-use";
// import { ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants";
import { useTextSpeech } from "~/hooks/useTextSpeech";
import { AppDialogVisibleState } from '~/state/appDialogVisibleState';
import { PromptInfoListState } from '~/state/promptState';
import { ShowDetailDialogVisibleState } from "~/state/showDetailDialogVisibleState";
// import { AiMessage, ChatHistory, ChatHistoryItem, ErrorMessage, MessageType } from "~/types/ai";
import { checkRole } from "~/util/checkRole";
import { preCheck } from "~/util/preCheck";
import { getPromptInfoList } from "~/util/getPrompt"

type DragPosition = { x: number; y: number };

// 起動バナーの位置を保存
const getSavedPosition = (): DragPosition | null => {
  const savedPosition = localStorage.getItem('bannerPosition');
  return savedPosition ? JSON.parse(savedPosition) : null;
};

export const useCornerDialogLogic = () => {
  const [isBannerDisplay, setIsBannerDisplay] = useState<boolean>(false);
  const [, setPromptInfoList] = useAtom(PromptInfoListState);
  const [isBannerClicked, setIsBannerClicked] = useState<boolean>(false);
  const [isAppDialogVisible, setIsAppDialogVisible] = useAtom(AppDialogVisibleState);
  // ダイアログの表示状態を管理するアトム
  const [isShowDetailDialogVisible, setIsShowDetailDialogVisible] = useAtom(ShowDetailDialogVisibleState);
  const [humanMessage, setHumanMessage] = useState("");
  const [callbackFuncs, setCallbackFuncs] = useState<Function[] | undefined>([]);

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
  const { setDisable, isSpeech } = useTextSpeech(
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

  // 事前チェックを実行
  const execPreCheck = async () => {
    try {
      // 操作ユーザがAA4k利用権限があるかをチェック
      const hasRole = await checkRole(kintone.getLoginUser().code);
      if (!hasRole) {
        return;
      }

      // 事前チェックの呼び出し
      const { resStatus: resPreCheckStatus } = await preCheck();
      if (resPreCheckStatus !== 200) {
        return;
      }
      setIsBannerDisplay(true);

      // プロンプト情報の取得
      execGetPromptInfoList();
    } catch (err) {
      // 何もしない
    }
  }

  // プロンプト情報の取得
  const execGetPromptInfoList = async () => {
    try {
      const { promptResult, resStatus: _resPromptStatus } = await getPromptInfoList();

      const promptInfoList = promptResult.promptInfoList;
      setPromptInfoList(promptInfoList);
    } catch (err) {
      // 何もしない
    }
  }

  // バナー表示時
  useEffect(() => {
    // 事前チェックを実行
    execPreCheck();
  }, []);

  // ダイアログ表示時にバナークリック状態をリセット
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

  const execCallbacks = () => {
    callbackFuncs?.forEach((fn) => fn());
  };

  // app生成AI機能の呼び出し後、音声出力が完了したのを確認したのちにapp生成AI機能からのcallbacksを実行する
  useUpdateEffect(() => {
    if (isAppDialogVisible && !isSpeech) {
      execCallbacks();
    }
  }, [isAppDialogVisible, isSpeech, callbackFuncs]);


  return {
    isAppDialogVisible,
    setIsAppDialogVisible,
    isShowDetailDialogVisible,
    setIsShowDetailDialogVisible,
    handleBannerClick,
    isBannerClicked,
    initialPosition,
    setInitialPosition,
    savePosition,
    savedPosition,
    humanMessage,
    setHumanMessage,
    setCallbackFuncs,
    aiAnswer,
    setAiAnswer,
    finishAiAnswer,
    setFinishAiAnswer,
    isBannerDisplay,
  };
};
