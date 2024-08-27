// エラーコード
export const ErrorCode = {
  // Langchain実行ログ登録(アプリ生成用)API(A106)
  A106001: "A106001",   // リクエストが不正
  A106002: "A106002",   // サブドメイン情報が存在しない
  A106099: "A106099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;