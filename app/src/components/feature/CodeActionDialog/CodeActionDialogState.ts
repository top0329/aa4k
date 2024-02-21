// src/components/feature/CodeActionDialog/CodeActionDialogState.ts
import { atom } from "jotai";
import { CodeActionDialogType, CodeCheckStatus } from "~/constants";

export const isCodeActionDialogState = atom(false);
export const codeActionDialogTypeState = atom<CodeActionDialogType>("codeCheck");
export const codeViolationsState = atom<string[]>([]);
export const codeCheckStatusState = atom<CodeCheckStatus>(CodeCheckStatus.loading);
