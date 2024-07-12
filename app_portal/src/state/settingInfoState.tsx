// src/state/settingInfoState.tsx
import { atom } from "jotai";
import { SettingInfo } from "~/types";

export const SettingInfoState = atom<SettingInfo>({ appName: "", fields: [] });
