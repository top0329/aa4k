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

// 発言区分
export const MessageType = {
  user: "user",
  ai: "ai",
  system: "system",
} as const;

// 契約ステータス
export const ContractStatus = {
  trial: "trial",
  active: "active",
  expired: "expired",
} as const;
export type ContractStatus = keyof typeof ContractStatus