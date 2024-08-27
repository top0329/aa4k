// エラーコード
export const ErrorCode = {
  // 認証チェック(A101)
  A101001: "A101001",   // ヘッダにサブドメインが存在しない
  A101002: "A101002",   // 許可IPアドレス以外のアクセス
  A101003: "A101003",   // サブドメイン情報が存在しない
  A101004: "A101004",   // 契約期間外
  A101099: "A101099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;