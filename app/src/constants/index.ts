// デバイス区分
export const DeviceDiv = {
  desktop: "desktop",
  mobile: "mobile",
} as const;
export type DeviceDiv = (typeof DeviceDiv)[keyof typeof DeviceDiv];

// 契約ステータス
export const ContractStatus = {
  trial: "trial",
  active: "active",
  expired: "expired",
} as const;
export type ContractStatus = keyof typeof ContractStatus;

// コード生成メソッド
export const CodeCreateMethod = {
  create: "CREATE",
  add: "ADD",
  update: "UPDATE",
  delete: "DELETE",
} as const;

// コードチェックステータス
export const CodeCheckStatus = {
  caution: "CAUTION",
  safe: "SAFE",
  loading: "LOADING"
} as const;
export type CodeCheckStatus =
  (typeof CodeCheckStatus)[keyof typeof CodeCheckStatus];

// コードアクションダイアログタイプ
export const CodeActionDialogType = {
  CodeCheck: "codeCheck",
  CodeFix: "codeFix",
} as const;
export type CodeActionDialogType =
  (typeof CodeActionDialogType)[keyof typeof CodeActionDialogType];

// ユーザー評価
export const UserRating = {
  good: "good",
  bad: "bad",
} as const;
export type UserRating = (typeof UserRating)[keyof typeof UserRating];

// エラーコード
export const ErrorCode = {
  // 認証チェック(A01)
  A01001: "A01001",   // ヘッダにサブスクリプションIDが存在しない
  A01002: "A01002",   // 許可IPアドレス以外のアクセス
  A01003: "A01003",   // サブスクリプション情報が存在しない
  A01004: "A01004",   // 契約期間外
  A01099: "A01099",   // その他例外エラー
  // 事前チェックAPI(A02)
  A02001: "A02001",   // リクエストが不正
  A02002: "A02002",   // プラグインバージョンサポート外
  A02003: "A02003",   // サブスクリプション情報が存在しない
  A02099: "A02099",   // その他例外エラー
  // 会話履歴API(A03)
  A03001: "A03001",   // 会話履歴取得_リクエストが不正
  A03002: "A03002",   // 会話履歴取得_サブスクリプション情報が存在しない
  A03099: "A03099",   // 会話履歴取得_その他例外エラー
  A03101: "A03101",   // 会話履歴登録_リクエストが不正
  A03102: "A03102",   // 会話履歴登録_サブスクリプション情報が存在しない
  A03199: "A03199",   // 会話履歴登録_その他例外エラー
  A03201: "A03201",   // ユーザ評価更新_リクエストが不正
  A03202: "A03202",   // ユーザ評価更新_サブスクリプション情報が存在しない
  A03299: "A03299",   // ユーザ評価更新_その他例外エラー
  // 最新JSコード取得API(A04)
  A04001: "A04001",   // リクエストが不正
  A04099: "A04099",   // その他例外エラー
  // コードテンプレート管理API(A05)
  A05001: "A05001",   // Retriever_リクエストが不正
  A05002: "A05002",   // サブスクリプション情報が存在しない
  A05099: "A05099",   // Retriever_その他例外エラー
  A05101: "A05101",   // 登録_リクエストが不正
  A05199: "A05199",   // 登録_その他例外エラー
  A05201: "A05201",   // 更新_リクエストが不正
  A05299: "A05299",   // 更新_その他例外エラー
  A05301: "A05301",   // 削除_リクエストが不正
  A05399: "A05399",   // 削除_その他例外エラー
  // Langchain実行ログ登録API(A06)
  A06001: "A06001", // リクエストが不正
  A06002: "A06002", // その他例外エラー
  // フロント側のエラーコード
  E00001: "E00001", // アプリIDが取得できない
  E00002: "E00002", // 契約期間外
  E00003: "E00003", // 契約ステータスが不正
  E00004: "E00004", // JS生成のLLM連携エラー
  E00005: "E00005", // コードチェックのLLM連携エラー
  E99999: "E99999", // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;

// 情報メッセージ
export const InfoMessage = {
  I_MSG001: "動作確認のためテスト環境画面に移動します。よろしいですか？",
  I_MSG002: "編集中の画面を閉じようとしています。編集内容は破棄されてしまいますがよろしいですか？",
} as const;

// エラーメッセージ
export const ErrorMessage = {
  E_MSG001: "正しく動作しませんでした。しばらくしてから再度実行してください。事象が改善されない場合は管理者にお問い合わせください。",
  E_MSG002: "新しいバージョンのプラグインが必要です。管理者にお問い合わせください。",
  E_MSG003: "現在ご利用することができません。管理者にお問い合わせください。",
} as const;
