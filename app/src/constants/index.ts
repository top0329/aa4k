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

// コードチェック結果
export const CodeCheckResult = {
  caution: "CAUTION",
  safe: "SAFE",
} as const;
export type CodeCheckResult =
  (typeof CodeCheckResult)[keyof typeof CodeCheckResult];

// エラーコード
export const ErrorCode = {
  // 認証チェック(A01)
  A01001: "A01001", // ヘッダにサブスクリプションIDが存在しない
  A01002: "A01002", // 許可IPアドレス以外のアクセス
  A01003: "A01003", // サブスクリプション情報が存在しない
  A01004: "A01004", // 契約期間外
  A01005: "A01005", // その他例外エラー
  // 事前チェックAPI(A02)
  A02001: "A02001", // リクエストが不正
  A02002: "A02002", // プラグインバージョンサポート外
  A02003: "A02003", // その他例外エラー
  // 会話履歴API(A03)
  A03001: "A03001", // 会話履歴取得_リクエストが不正
  A03002: "A03002", // 会話履歴取得_その他例外エラー
  A03101: "A03101", // 会話履歴登録_リクエストが不正
  A03102: "A03102", // 会話履歴登録_その他例外エラー
  // 最新JSコード取得API(A04)
  A04001: "A04001", // リクエストが不正
  A04002: "A04002", // その他例外エラー
  // コードテンプレート管理API(A05)
  A05001: "A05001", // Retriever_リクエストが不正
  A05002: "A05002", // Retriever_その他例外エラー
  A05101: "A05101", // 登録_リクエストが不正
  A05102: "A05102", // 登録_その他例外エラー
  A05201: "A05201", // 更新_リクエストが不正
  A05202: "A05202", // 更新_その他例外エラー
  A05301: "A05301", // 削除_リクエストが不正
  A05302: "A05302", // 削除_その他例外エラー
  // Langchain実行ログ登録API(A06)
  A06001: "A06001", // リクエストが不正
  A06002: "A06002", // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;

export const ErrorMessage = {
  currentlyUnavailable: "現在利用できません。管理者にお問い合わせください。",
  unsupportedVersion:
    "現在のバージョンでは利用できません。管理者にお問い合わせください。",
  UnavailableScreen: "この画面では利用できません。",
} as const;