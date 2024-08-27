// エラーコード
export const ErrorCode = {
  // Azure OpenAI Proxy CredentialAPI(A108)
  A108001: "A108001",   // リクエストが不正
  A108002: "A108002",   // サブドメイン情報が存在しない
  A108099: "A108099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;