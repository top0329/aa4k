// エラーコード
export const ErrorCode = {
  // 事前チェックAPI(A02)
  A02001: "A02001",   // リクエストが不正
  A02002: "A02002",   // プラグインバージョンサポート外
  A02003: "A02003",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;