// エラーコード
export const ErrorCode = {
  // Text To Speech API(A17)
  A17001: "A17001",   // リクエストが不正
  A17099: "A17099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;