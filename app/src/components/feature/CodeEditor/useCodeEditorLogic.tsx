// src/components/feature/CodeEditor/useCodeEditorLogic.tsx
import { useAtom } from 'jotai';
import { useState } from 'react';
import { DockItemVisibleState } from '~/components/feature/Dock/DockState';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { CodeActionDialogType } from '~/types/codeActionTypes';
import { codeActionDialogTypeState, isCodeActionDialogState } from '../CodeActionDialog/CodeActionDialogState';

export const useCodeEditorLogic = () => {
  const [code, setCode] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [, setDockState] = useAtom(DockItemVisibleState);
  const [, setIsCodeActionDialog] = useAtom(isCodeActionDialogState);
  const [, setDialogType,] = useAtom(codeActionDialogTypeState);

  const { copyToClipboard, copySuccess } = useCopyToClipboard();

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleRunCodeAction = (type: CodeActionDialogType) => {
    setDialogType(type);
    setIsCodeActionDialog(true);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      setDockState(dockState => ({ ...dockState, chatVisible: false }));
    } else {
      setDockState(dockState => ({ ...dockState, chatVisible: true }));
    }
  };

  return {
    code,
    copySuccess,
    isFullScreen,
    setCode,
    handleRunCodeAction,
    handleCodeChange,
    toggleFullScreen,
    copyToClipboard,
  };
};

