// エラーコード
export const ErrorCode = {
  // 認証チェック(A01)
  A01001: "A01001",   // ヘッダにサブスクリプションIDが存在しない
  A01002: "A01002",   // 許可IPアドレス以外のアクセス
  A01003: "A01003",   // サブスクリプション情報が存在しない
  A01004: "A01004",   // 契約期間外
  A01005: "A01005",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;