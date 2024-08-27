// エラーコード
export const ErrorCode = {
  // アプリ生成用_会話履歴API(A103)
  A103001: "A103001",   // 会話履歴登録_リクエストが不正
  A103002: "A103002",   // 会話履歴登録_サブドメイン情報が存在しない
  A103099: "A103099",   // 会話履歴登録_その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;
