// src/components/feature/CodeEditor/CodeEditor.tsx
import { useAtom } from 'jotai';
import { useState } from 'react';
import { DockItemVisibleState } from '~/components/feature/Dock/DockState';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const useCodeEditorLogic = () => {
  const [code, setCode] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [, setDockState] = useAtom(DockItemVisibleState);

  const { copyToClipboard, copySuccess } = useCopyToClipboard();

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleRunCode = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e);
  }

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
    handleRunCode,
    handleCodeChange,
    toggleFullScreen,
    copyToClipboard,
  };
};
