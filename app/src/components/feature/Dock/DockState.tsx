// src/components/feature/Dock/DockState.tsx
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { ChatMode } from "~/constants";

export const DockItemVisibleState = atomWithStorage(`DockItem_App_${kintone.app.getId()}`, {
  dialogVisible: false,
  chatVisible: false,
  codeEditorVisible: false,
  spChatVisible: false,
});

export const activeChatModeState = atom<ChatMode>(ChatMode.desktopChat);
