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

// Parameter Store情報(AA4K_CONST_PARAMETER_NAME)
export interface AA4KConstParameterValue {
  allowedCidrs: string[],
  retrieveMaxCount: number,
  retrieveScoreThreshold: number,
  historyUseCount: number,
}

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
export type ContractStatus = keyof typeof ContractStatus
// redis空レコード
export type RedisEmptyRecord = Record<string, never>

// redis空レコード判定
export function isRedisEmptyRecord(record: Record<string, string>): record is RedisEmptyRecord {
  return Object.keys(record).length === 0;
}