// エラーコード
export const ErrorCode = {
  // コードテンプレート管理API(A05)
  A05101: "A05101",   // 登録_リクエストが不正
  A05199: "A05199",   // 登録_その他例外エラー
  A05201: "A05201",   // 更新_リクエストが不正
  A05299: "A05299",   // 更新_その他例外エラー
  A05301: "A05301",   // 削除_リクエストが不正
  A05399: "A05399",   // 削除_その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;
