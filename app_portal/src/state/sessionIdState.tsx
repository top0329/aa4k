// src/state/sessionIdState.tsx
import { atom } from "jotai";
import { v4 as uuidv4 } from 'uuid';
export const SessionIdState = atom<string>(uuidv4());
