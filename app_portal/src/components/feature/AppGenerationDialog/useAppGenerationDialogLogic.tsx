// src/components/feature/AppGenerationDialog/useAppGenerationDialogLogic.tsx

import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { InfoMessage } from '~/constants';
import { AppDialogVisibleState } from '~/state/appDialogVisibleState';

type AppGenerationDialogProps = {
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  setAiAnswer: React.Dispatch<React.SetStateAction<string>>,
  setFinishAiAnswer: React.Dispatch<React.SetStateAction<boolean>>,
}

export const useAppGenerationDialogLogic = ({ setHumanMessage, setAiAnswer, setFinishAiAnswer }: AppGenerationDialogProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // ダイアログの表示状態を管理するアトム
  const [isVisible, setIsVisible] = useAtom(AppDialogVisibleState);
  // ダイアログが初期表示されているかどうかの状態を管理
  const [isInitVisible, setIsInitVisible] = useState<boolean>(true);
  // ロード画面を表示するかどうかの状態を管理
  const [isLoadingVisible, setIsLoadingVisible] = useState<boolean>(false);

  // ダイアログの表示状態を切り替える
  const toggleDialogVisibility = () => {
    if (window.confirm(`${InfoMessage.I_MSG001}`)) {
      setIsVisible(false);
      setHumanMessage("");
    }
  };

  // ロード画面の表示状態を切り替える
  const toggleAiLoadVisibility = (text: string) => {
    setHumanMessage(text);
    setIsLoadingVisible(prevState => !prevState);
    setAiAnswer(`${InfoMessage.I_MSG004}`)
    setFinishAiAnswer(true);
  };

  // アプリを作成するボタン押下時の処理
  const createKintoneApp = (text: string) => {
    toggleAiLoadVisibility(text);

    // TODO：アプリ生成処理

  }

  return {
    isVisible,
    setIsVisible,
    toggleDialogVisibility,
    isInitVisible,
    setIsInitVisible,
    isLoadingVisible,
    toggleAiLoadVisibility,
    createKintoneApp,
    scrollRef,
  };
};
