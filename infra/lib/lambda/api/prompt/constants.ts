// エラーコード
export const ErrorCode = {
  // プロンプト取得API(A09)
  A09001: "A09001",   // リクエストが不正
  A09002: "A09002",   // プロンプトデータなしエラー
  A09099: "A09099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;