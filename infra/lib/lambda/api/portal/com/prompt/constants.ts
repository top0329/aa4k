// エラーコード
export const ErrorCode = {
  // プロンプト取得(ポータル機能用)API(A109)
  A109001: "A109001",   // リクエストが不正
  A109002: "A109002",   // プロンプトデータなしエラー
  A109099: "A109099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;