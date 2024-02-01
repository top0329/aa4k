// src/hooks/useCornerDialogLogic.tsx
import { useAtom } from "jotai";
import { Conversation } from "~/types/agents";
import { useCodeEditorLogic } from "../CodeEditor/useCodeEditorLogic";
import { DockItemVisibleState } from "../Dock/DockState";

export const useCornerDialogLogic = () => {
  const [dockItemVisible, setDockItemVisible] = useAtom(DockItemVisibleState);
  // code editor logic
  const { code, executeCode,
    handleCodeChange,
    toggleFullScreen,
    copyCodeToClipboard,
  } = useCodeEditorLogic();


  const onSubmit = (data: { example: string }) => {
    console.log(data);
    executeCode();
  };

  // dummy data
  const conversations: Conversation[] = [
  ];

  return {
    dockItemVisible,
    setDockItemVisible,
    onSubmit, conversations,
    code, handleCodeChange,
    toggleFullScreen,
    copyCodeToClipboard,
  };
};
