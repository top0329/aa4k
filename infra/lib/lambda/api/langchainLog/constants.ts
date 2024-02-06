// エラーコード
export const ErrorCode = {
  // Langchain実行ログ登録API(A06)
  A06001: "A06001",   // リクエストが不正
  A06002: "A06002",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;