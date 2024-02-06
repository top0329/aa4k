// redis空レコード
export type RedisEmptyRecord = Record<string, never>

// Secret Manager情報(AZURE_SECRET_NAME)
export interface AzureSecretValue {
  azureOpenAIApiKey: string,
  azureOpenAIEmbeddingApiVersion: string,
  azureOpenAIApiInstanceName: string,
  azureOpenAIEmbeddingApiDeploymentName: string,
}