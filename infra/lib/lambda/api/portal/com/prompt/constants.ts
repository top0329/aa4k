// エラーコード
export const ErrorCode = {
  // プロンプト取得(ポータル機能用)API(A19)
  A19001: "A19001",   // リクエストが不正
  A19002: "A19002",   // プロンプトデータなしエラー
  A19099: "A19099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;