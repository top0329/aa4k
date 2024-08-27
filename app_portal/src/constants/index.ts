// メッセージ種別
export const MessageType = {
  human: "human",
  ai: "ai",
  system: "system",
  error: "error",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

// サービス区分
export const ServiceDiv = {
  app_gen_type: "app_gen_type",
  app_gen_create_field: "app_gen_create_field",
  app_gen_edit_field: "app_gen_edit_field",
  app_gen_field: "app_gen_field",
  app_gen_field_retry: "app_gen_field_retry",
  app_gen_layout: "app_gen_layout",
  app_gen_layout_retry: "app_gen_layout_retry",
} as const;
export type ServiceDiv = keyof typeof ServiceDiv;

// アクション種別
export const ActionType = {
  create: "create",
  edit: "edit",
  duplicate: "duplicate",
  other: "other",
  complete: "complete",
  unknown: "unknown",
  error: "error",
} as const;
export type ActionType = keyof typeof ActionType;

// 実行結果
export const ExecResult = {
  success: "success",
  error: "error",
} as const;
export type ExecResult = keyof typeof ExecResult;

// 契約ステータス
export const ContractStatus = {
  trial: "trial",
  active: "active",
  expired: "expired",
} as const;
export type ContractStatus = keyof typeof ContractStatus;

// LLM種別
export const LlmType = {
  openai: "openai",
  azure: "azure",
} as const;
export type LlmType = keyof typeof LlmType;

// エラーコード
export const ErrorCode = {
  // 認証チェックAPI(A101)
  A101001: "A101001",   // ヘッダにサブドメインが存在しない
  A101002: "A101002",   // 許可IPアドレス以外のアクセス
  A101003: "A101003",   // DBにサブドメイン情報が存在しない
  A101004: "A101004",   // 契約期間外
  A101099: "A101099",   // その他例外エラー
  // 事前チェックAPI(A102)
  A102001: "A102001",   // リクエストが不正
  A102002: "A102002",   // ポータルバージョンサポート外
  A102003: "A102003",   // DBにサブドメイン情報が存在しない
  A102099: "A102099",   // その他例外エラー
  // 会話履歴API(A103)
  A103001: "A103001",   // 会話履歴登録_リクエストが不正
  A103002: "A103002",   // 会話履歴登録_サブドメイン情報が存在しない
  A103099: "A103099",   // 会話履歴登録_その他例外エラー
  // Langchain実行ログ登録API(A106)
  A106001: "A106001", // リクエストが不正
  A106002: "A106002", // DBにサブドメイン情報が存在しない
  A106099: "A106099", // その他例外エラー
  // Text To Speech API(A107)
  A107001: "A107001",   // リクエストが不正
  A107099: "A107099",   // その他例外エラー
  // プロンプト取得API(A109)
  A109001: "A109001",   // リクエストが不正
  A109002: "A109002",   // プロンプトデータなしエラー
  A109099: "A109099",   // その他例外エラー
  // フロント側のエラーコード
  E10001: "E10001", // 契約期間外
  E10002: "E10002", // 契約ステータスが不正
  E10003: "E10003", // アプリ生成のLLM連携エラー
  E10004: "E10004", // kintone REST APIのエラー
  E10005: "E10005", // OpenAI API Key不正
  E10006: "E10006", // レート制限によるエラー
  E10007: "E10007", // LLM プロンプト情報の取得なし
  E10008: "E10008", // フィールド追加リトライ失敗
  E99999: "E99999", // その他例外エラー
} as const;
export type ErrorCode = keyof typeof ErrorCode;

// 情報メッセージ
export const InfoMessage = {
  I_MSG001: "アプリの作成を終了します。\r\nこれまでのやり取りは破棄されますが、よろしいですか？",
  I_MSG002: "アプリの作成を最初からやり直します。\r\nこれまでのやり取りは破棄されますが、よろしいですか？",
  I_MSG003: "この内容でよろしいでしょうか？",
  I_MSG004: "アプリを作成します。少々お待ちください。",
  I_MSG005: "かしこまりました、少々お待ちください。",
  I_MSG006: "かしこまりました。アプリを作成しますので少々お待ちください。\n作成が完了すると、アプリ画面に遷移します。",
} as const;

// エラーメッセージ
export const ErrorMessage = {
  E_MSG001: "AI処理に失敗しました。",
  E_MSG002: "お手数ですが、再度、作成したいアプリを入力しなおしてください。\nより詳しい表現に変えるとAIが認識しやすくなります。",
  E_MSG003: "アプリの生成に失敗しました。",
  E_MSG004: "以下はAIがご提案中の内容です。\nこちらの内容でよろしければ「アプリを作成する」をクリックしてください。\nまた、アプリ名やフィールドの変更をする場合はお知らせください。",
  E_MSG005: "メッセージ送信中に画面操作されたため正しく処理できませんでした。",
  E_MSG006: "現在ご利用することができません。",
  E_MSG007: "アクセスが集中しています。しばらくしてから再度実行してください。",
  E_MSG008: "予期せぬ問題が発生したためjavascript生成に失敗しました。再度実行しても事象が改善されない場合は管理者にお問い合わせください。",
  E_MSG009: "AIによるjavaScriptの生成に失敗しました。再実行するか、より詳しい表現に変えてお試しください。",

  E_MSG010: "現在ご利用できません。管理者にお問い合わせください。",
  E_MSG011: "予期せぬ問題が発生しました。事象が改善されない場合は管理者にお問い合わせください。",
  E_MSG012: "AIへの問い合わせに失敗しました。事象が改善されない場合は管理者にお問い合わせください。",
  E_MSG013: "AIへの接続が制限されています。事象が改善されない場合は管理者にお問い合わせください。",
  E_MSG014: "新しいバージョンのカスタマイズJavaScriptが必要です。管理者にお問い合わせください。",
  E_MSG015: "アプリの生成に失敗しました。\nお手数ですが、再度、作成したいアプリを入力しなおしてください。\nより詳しい表現に変えるとAIが認識しやすくなります。\n事象が改善されない場合は管理者にお問い合わせください。",
} as const;
