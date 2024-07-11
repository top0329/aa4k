// src/components/feature/AppGenerationDialog/useAppGenerationDialogLogic.tsx

import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { AppDialogVisibleState } from '~/state/appDialogVisibleState';

type AppGenerationDialogProps = {
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const useAppGenerationDialogLogic = ({ setHumanMessage }: AppGenerationDialogProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // ダイアログの表示状態を管理するアトム
  const [isVisible, setIsVisible] = useAtom(AppDialogVisibleState);
  // ダイアログが初期表示されているかどうかの状態を管理
  const [isInitVisible, setIsInitVisible] = useState<boolean>(true);
  // ロード画面を表示するかどうかの状態を管理
  const [isLoadingVisible, setIsLoadingVisible] = useState<boolean>(false);

  // ダイアログの表示状態を切り替える
  const toggleDialogVisibility = () => {
    if (window.confirm('アプリの作成を終了します。\r\nこれまでのやり取りは破棄されますが、よろしいですか？')) {
      setIsVisible(false);
      setHumanMessage("");
    }
  };

  // ロード画面の表示状態を切り替える
  const toggleAiLoadVisibility = (text: string) => {
    setHumanMessage(text);
    setIsLoadingVisible(prevState => !prevState);
  };

  return {
    isVisible,
    setIsVisible,
    toggleDialogVisibility,
    isInitVisible,
    setIsInitVisible,
    isLoadingVisible,
    toggleAiLoadVisibility,
    scrollRef,
  };
};
