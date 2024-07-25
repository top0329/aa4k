// エラーコード
export const ErrorCode = {
  // 最新JSコード取得API(A04)
  A04001: "A04001",   // リクエストが不正
  A04002: "A04002",   // サブスクリプション情報が存在しない
  A04099: "A04099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;
