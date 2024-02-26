import { atom } from "jotai";

export const humanMessageState = atom<string>('');
export const voiceInputState = atom(false);
export const callbackFuncsState = atom<Function[] | undefined>([]);
export const voiceInputVisibleState = atom(true);
