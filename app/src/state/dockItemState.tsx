// src\state\dockItemState.tsx
import { atomWithStorage } from "jotai/utils";

export const DockItemVisibleState = atomWithStorage(`DockItem_App_${kintone.app.getId()}`, {
  dialogVisible: false,
  chatVisible: false,
  dataGenChatVisible: false,
  codeEditorVisible: false,
  spChatVisible: false,
});
