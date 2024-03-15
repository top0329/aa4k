// エラーコード
export const ErrorCode = {
  // Azure OpenAI Proxy CredentialAPI(A07)
  A07001: "A07001",   // リクエストが不正
  A07002: "A07002",   // サブスクリプション情報が存在しない
  A07099: "A07099",   // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;