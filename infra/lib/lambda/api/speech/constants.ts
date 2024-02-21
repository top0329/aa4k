// エラーコード
export const ErrorCode = {
  // Text To Speech API(A07)
  A07001: "A07001",   // リクエストが不正
  A07099: "A07099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;