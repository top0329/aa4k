// エラーコード
export const ErrorCode = {
  // Azure OpenAI Proxy CredentialAPI(A18)
  A18001: "A18001",   // リクエストが不正
  A18002: "A18002",   // サブドメイン情報が存在しない
  A18099: "A18099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;