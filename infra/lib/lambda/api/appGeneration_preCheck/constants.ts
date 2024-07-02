// エラーコード
export const ErrorCode = {
  // 事前チェック_アプリ生成用API(A12)
  A12001: "A12001",   // リクエストが不正
  A12002: "A12002",   // ポータルJSバージョンサポート外
  A12003: "A12003",   // サブドメイン情報が存在しない
  A12099: "A12099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;