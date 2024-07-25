// エラーコード
export const ErrorCode = {
  // コードテンプレート管理API(A05)
  A05001: "A05001",   // Retriever_リクエストが不正
  A05002: "A05002",   // Retriever_サブスクリプション情報が存在しない
  A05003: "A05003",   // Retriever_OpenAI API Key不正
  A05099: "A05099",   // Retriever_その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;
