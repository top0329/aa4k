// src/types/codeActionTypes.ts

export const CodeActionDialogType = {
  CodeCheck: "codeCheck",
  CodeFix: "codeFix",
} as const;

export type CodeActionDialogType =
  (typeof CodeActionDialogType)[keyof typeof CodeActionDialogType];

export const CodeCheckStatus = {
  Success: "success",
  Loading: "loading",
  Error: "error",
} as const;

export type CodeCheckStatus =
  (typeof CodeCheckStatus)[keyof typeof CodeCheckStatus];
