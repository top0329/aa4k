// Secret Manager情報(DB_ACCESS_SECRET_NAME)
export interface DbAccessSecretValue {
  engine: string,
  env: string,
  dbname: string,
  username: string,
  password: string,
  port: number,
}

// Secret Manager情報(AZURE_SECRET_NAME)
export interface AzureSecretValue {
  azureOpenAIApiKey: string,
  azureOpenAIEmbeddingApiVersion: string,
  azureOpenAIApiInstanceName: string,
  azureOpenAIEmbeddingApiDeploymentName: string,
}

// リクエストヘッダ
export const RequestHeaderName = {
  aa4kSubscriptionId: "aa4k-subscription-id",
  aa4kPluginVersion : "aa4k-plugin-version",
  aa4kApiKey : "aa4k-api-key",
} as const;

// デバイス
export const DeviceDiv = {
  desktop: "desktop",
  mobile: "mobile",
} as const;

// 発言区分
export const MessageDiv = {
  user: "user",
  ai: "ai",
} as const;

// 契約ステータス
export const ContractStatus = {
  trial: "trial",
  active: "active",
  expired: "expired",
} as const;
