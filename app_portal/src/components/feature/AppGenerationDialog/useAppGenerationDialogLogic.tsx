// src/components/feature/AppGenerationDialog/useAppGenerationDialogLogic.tsx

import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { AppDialogVisibleState } from '~/state/appDialogVisibleState';

export const useAppGenerationDialogLogic = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // ダイアログの表示状態を管理するアトム
  const [isVisible, setIsVisible] = useAtom(AppDialogVisibleState);
  // ダイアログが初期表示されているかどうかの状態を管理
  const [isInitVisible, setIsInitVisible] = useState<boolean>(true);

  // ダイアログの表示状態を切り替える
  const toggleDialogVisibility = () => {
    if (window.confirm('アプリの作成を終了します。\r\nこれまでのやり取りは破棄されますが、よろしいですか？')) {
      setIsVisible(false);
    }
  };

  return {
    isVisible,
    setIsVisible,
    toggleDialogVisibility,
    isInitVisible,
    setIsInitVisible,
    scrollRef,
  };
};
