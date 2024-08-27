// エラーコード
export const ErrorCode = {
  // 事前チェック_アプリ生成用API(A102)
  A102001: "A102001",   // リクエストが不正
  A102002: "A102002",   // ポータルJSバージョンサポート外
  A102003: "A102003",   // サブドメイン情報が存在しない
  A102099: "A102099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;