// エラーコード
export const ErrorCode = {
  // 会話履歴API(A03)
  A03001: "A03001",   // 会話履歴取得_リクエストが不正
  A03099: "A03099",   // 会話履歴取得_その他例外エラー
  A03101: "A03101",   // 会話履歴登録_リクエストが不正
  A03199: "A03199",   // 会話履歴登録_その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;
