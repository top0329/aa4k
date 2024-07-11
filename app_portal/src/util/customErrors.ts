// カスタムエラーオブジェクト
// LLM連携エラー
export class LlmError extends Error { }
// kintoneエラー
export class KintoneError extends Error { }
// LambdaAPI連携エラー
export class ApiError extends Error { }


export class ContractExpiredError extends Error { }
export class ContractStatusError extends Error { }
