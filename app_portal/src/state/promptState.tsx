// src/state/promptState.tsx
import { atom } from "jotai";
import { PromptInfoList } from "~/types/apiInterfaces";

export const PromptInfoListState = atom<PromptInfoList>([]);
