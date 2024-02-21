import { atom } from "jotai";

export const CodeState = atom<string>("");
export const CodeLatestState = atom<string>("");
export const IsChangeCodeState = atom<boolean>(false);