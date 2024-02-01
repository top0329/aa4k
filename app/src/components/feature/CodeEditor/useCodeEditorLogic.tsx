// src/components/feature/CodeEditor/CodeEditor.tsx
import { useAtom } from 'jotai';
import { useState } from 'react';
import { DockItemVisibleState } from '~/components/feature/Dock/DockState';

export const useCodeEditorLogic = () => {
  const [code, setCode] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [, setDockState] = useAtom(DockItemVisibleState);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleRunCode = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e);
  }

  const executeCode = () => {
    try {
      // Logic to execute code
      console.log('Executing code:', code);
    } catch (error) {
      console.error('Error executing code:', error);
    }
  };



  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      setDockState(dockState => ({ ...dockState, chatVisible: false }));
    } else {
      setDockState(dockState => ({ ...dockState, chatVisible: true }));
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Hide icon after 2 seconds
    });
  };

  return {
    code,
    copySuccess,
    isFullScreen,
    setCode,
    handleRunCode,
    handleCodeChange,
    executeCode,
    toggleFullScreen,
    copyCodeToClipboard,
  };
};
