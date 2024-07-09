// エラーコード
export const ErrorCode = {
  // 認証チェック(A11)
  A11001: "A11001",   // ヘッダにサブドメインが存在しない
  A11002: "A11002",   // 許可IPアドレス以外のアクセス
  A11003: "A11003",   // サブドメイン情報が存在しない
  A11004: "A11004",   // 契約期間外
  A11099: "A11099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;