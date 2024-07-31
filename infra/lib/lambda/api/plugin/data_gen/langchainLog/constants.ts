// エラーコード
export const ErrorCode = {
  // Langchain実行ログ登録API(A06)
  A11001: "A11001",   // リクエストが不正
  A11002: "A11002",   // サブスクリプション情報が存在しない
  A11099: "A11099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;