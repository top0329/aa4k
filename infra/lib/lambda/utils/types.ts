// redis空レコード
export type RedisEmptyRecord = Record<string, never>

// Secret Manager情報(AZURE_SECRET_NAME)
export interface AzureSecretValue {
  azureOpenAIApiKey: string,
  azureOpenAIApiDeploymentName: string,
  azureOpenAIApiVersion: string,
  azureOpenAIEmbeddingApiVersion: string,
  azureOpenAIApiInstanceName: string,
  azureOpenAIEmbeddingApiDeploymentName: string,
}

// Secret Manager情報(DB_ACCESS_SECRET_NAME)
export interface DbAccessSecretValue {
  engine: string,
  env: string,
  dbname: string,
  username: string,
  password: string,
  port: number,
}
