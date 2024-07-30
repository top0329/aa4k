// src\components\feature\ShowDetailDialog\useShowDetailDialogLogic.tsx

import { useAtom } from 'jotai';
import { useRef } from 'react';
import { ShowDetailDialogVisibleState } from '~/state/showDetailDialogVisibleState';

type ShowDetailDialogProps = {}

export const useShowDetailDialogLogic = ({ }: ShowDetailDialogProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // ダイアログの表示状態を管理するアトム
  const [, setIsShowDetailDialogVisible] = useAtom(ShowDetailDialogVisibleState);

  // ダイアログの表示状態を切り替える
  const toggleShowDetailDialogVisibility = () => {
    setIsShowDetailDialogVisible(prev => !prev);
  }

  return {
    scrollRef,
    toggleShowDetailDialogVisibility,
  };
};
