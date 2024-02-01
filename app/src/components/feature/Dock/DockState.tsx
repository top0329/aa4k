// src/components/feature/Dock/DockState.tsx
import { atomWithStorage } from "jotai/utils";

export const DockItemVisibleState = atomWithStorage(`DockItem_App_${kintone.app.getId()}`, {
  dialogVisible: false,
  chatVisible: false,
  codeEditorVisible: false,
});
