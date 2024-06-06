// src/state/promptState.tsx
import { atom } from "jotai";
import { PromptInfoList } from "~/types/apiResponse";

export const PromptInfoListState = atom<PromptInfoList>([]);
