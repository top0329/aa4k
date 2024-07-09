// エラーコード
export const ErrorCode = {
  // アプリ生成用_会話履歴API(A13)
  A13001: "A13001",   // 会話履歴登録_リクエストが不正
  A13002: "A13002",   // 会話履歴登録_サブドメイン情報が存在しない
  A13099: "A13099",   // 会話履歴登録_その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;
