// エラーコード
export const ErrorCode = {
  // Langchain実行ログ登録API(A06)
  A06001: "A06001",   // リクエストが不正
  A06099: "A06099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;