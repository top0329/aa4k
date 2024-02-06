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

// メッセージ種別
export const MessageType = {
  human: "human",
  ai: "ai",
  system: "system",
} as const;
export type MessageType = keyof typeof MessageType

// 契約ステータス
export const ContractStatus = {
  trial: "trial",
  active: "active",
  expired: "expired",
} as const;
export type ContractStatus = keyof typeof ContractStatus