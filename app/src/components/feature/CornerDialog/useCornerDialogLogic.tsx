// src/hooks/useCornerDialogLogic.tsx
import { useAtom } from "jotai";
import { useCodeEditorLogic } from "../CodeEditor/useCodeEditorLogic";
import { DockItemVisibleState } from "../Dock/DockState";
import { ConversationsState } from "./CornerDialogState";

export const useCornerDialogLogic = () => {
  // ConversationsState
  const [conversations] = useAtom(ConversationsState);
  const [dockItemVisible, setDockItemVisible] = useAtom(DockItemVisibleState);

  // code editor logic
  const { code,
    handleCodeChange,
    toggleFullScreen,
  } = useCodeEditorLogic();

  return {
    dockItemVisible,
    setDockItemVisible,
    conversations,
    code, handleCodeChange,
    toggleFullScreen,
  };
};
