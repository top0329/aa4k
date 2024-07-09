// エラーコード
export const ErrorCode = {
  // Langchain実行ログ登録(アプリ生成用)API(A16)
  A16001: "A16001",   // リクエストが不正
  A16002: "A16002",   // サブドメイン情報が存在しない
  A16099: "A16099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;