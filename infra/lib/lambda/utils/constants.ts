// リクエストヘッダ
export const RequestHeaderName = {
  aa4kSubscriptionId: "aa4k-subscription-id",
  aa4kPluginVersion: "aa4k-plugin-version",
  aa4kApiKey: "aa4k-api-key",
} as const;

// デバイス
export const DeviceDiv = {
  desktop: "desktop",
  mobile: "mobile",
} as const;
export type DeviceDiv = keyof typeof DeviceDiv;

// メッセージ種別
export const MessageType = {
  human: "human",
  ai: "ai",
  error: "error",
} as const;
export type MessageType = keyof typeof MessageType

// 契約ステータス
export const ContractStatus = {
  trial: "trial",
  active: "active",
  expired: "expired",
} as const;
export type ContractStatus = keyof typeof ContractStatus

// ユーザー評価
export const UserRating = {
  good: "good",
  bad: "bad",
} as const;
export type UserRating = keyof typeof UserRating