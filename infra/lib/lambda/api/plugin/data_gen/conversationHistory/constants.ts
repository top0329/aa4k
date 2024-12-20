// エラーコード
export const ErrorCode = {
  // 会話履歴API(A10)
  A10001: "A10001",   // 会話履歴取得_リクエストが不正
  A10002: "A10002",   // 会話履歴取得_サブスクリプション情報が存在しない
  A10099: "A10099",   // 会話履歴取得_その他例外エラー
  A10101: "A10101",   // 会話履歴登録_リクエストが不正
  A10102: "A10102",   // 会話履歴登録_サブスクリプション情報が存在しない
  A10199: "A10199",   // 会話履歴登録_その他例外エラー
  A10201: "A10201",   // 会話履歴クリア_リクエストが不正
  A10202: "A10202",   // 会話履歴クリア_サブスクリプション情報が存在しない
  A10299: "A10299",   // 会話履歴クリア_その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;
