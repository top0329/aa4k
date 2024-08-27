// エラーコード
export const ErrorCode = {
  // Text To Speech API(A107)
  A107001: "A107001",   // リクエストが不正
  A107099: "A107099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;