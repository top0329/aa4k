import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { AzureSecretValue, DbAccessSecretName } from "./type"
import { Client, ClientConfig } from "pg";
import { PGVectorStore } from "langchain/vectorstores/pgvector";

const secretsManagerClient = new SecretsManagerClient();

/**
 * Secret Manager情報の取得
 * @param secretName 
 * @returns Secret Manager情報
 */
export const getSecretValue = async (secretName: string) => {
  // Secret Managerから情報取得
  const result = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: secretName,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
  // 取得できない場合はエラー
  if (!result.SecretString) throw 'Secret value is empty';

  const SecretValue = JSON.parse(result.SecretString);
  return SecretValue;
}

/**
 * DB接続情報
 * @param dbAccessSecretValue 
 * @returns DB接続情報
 */
export const getDbConfig = async (dbAccessSecretValue: DbAccessSecretName) => {
  return {
    type: dbAccessSecretValue.engine,
    host: process.env.RDS_PROXY_ENDPOINT,
    database: dbAccessSecretValue.dbname,
    user: dbAccessSecretValue.username,
    password: dbAccessSecretValue.password,
    port: dbAccessSecretValue.port,
    ssl: true,
  };
}


/**
 * PGVectorStoreのインスタンス生成
 * @param dbConfig 
 * @param azureSecretValue 
 * @param apiKey 
 * @returns PGVectorStore
 */
export const pgVectorInitialize = async (dbConfig: ClientConfig, azureSecretValue: AzureSecretValue, apiKey?: string) => {
  let embeddings;
  if (apiKey) {
    embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002",
      openAIApiKey: apiKey,
    });
  } else {
    embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002",
      azureOpenAIApiKey: azureSecretValue.azureOpenAIApiKey,
      azureOpenAIApiVersion: azureSecretValue.azureOpenAIEmbeddingApiVersion,
      azureOpenAIApiInstanceName: azureSecretValue.azureOpenAIApiInstanceName,
      azureOpenAIApiDeploymentName: azureSecretValue.azureOpenAIEmbeddingApiDeploymentName,
    });
  }

  return await PGVectorStore.initialize(
    embeddings,
    {
      postgresConnectionOptions: dbConfig,
      collectionTableName: "langchain_embedding_collection",
      collectionName: "codeTemplate",
      tableName: "langchain_embedding",
      columns: {
        idColumnName: "id",
        vectorColumnName: "vector",
        contentColumnName: "content",
        metadataColumnName: "metadata",
      },
    }
  );
}
