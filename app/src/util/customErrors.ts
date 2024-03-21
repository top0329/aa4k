// カスタムエラーオブジェクト
// LLM連携エラー
export class LlmError extends Error { }
// kintoneエラー
export class KintoneError extends Error { }
// LambdaAPI連携エラー
export class ApiError extends Error { }
// レトリバーエラー
export class RetrieveError extends Error { }
// kintoneガイドライン取得エラー
export class GuidelineError extends Error { }
export class ContractExpiredError extends Error { }
export class ContractStatusError extends Error { }

