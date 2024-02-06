import { useAtom } from "jotai";
import { ConversationsState } from "../CornerDialog/CornerDialogState";
import { DockItemVisibleState } from "./DockState";

export const useDockLogic = () => {
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [, setConversations] = useAtom(ConversationsState)
  const toggleItemVisibility = (itemKey: keyof typeof dockState) => {
    setDockState({ ...dockState, [itemKey]: !dockState[itemKey] });
  };

  const initDockState = () => {
    setDockState({
      dialogVisible: false,
      chatVisible: true,
      codeEditorVisible: false,
    });
  }

  const deleteHistory = () => {
    setConversations([]);
  }

  return {
    dockState,
    setDockState,
    toggleItemVisibility,
    initDockState,
    deleteHistory,
  };
}
