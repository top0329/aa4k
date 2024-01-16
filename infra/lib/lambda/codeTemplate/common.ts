import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { AzureSecretValue, pgVectorInitializeOptions } from "./type";
import { DbAccessSecretValue } from "../utils/type";
import { ClientConfig } from "pg";
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
 * Secret Manager情報（DB, Azure）の取得
 * @returns Secret Manager情報
 */
export const getSecretValues = async () => {
  const dbAccessSecretName = process.env.DB_ACCESS_SECRET_NAME ? process.env.DB_ACCESS_SECRET_NAME : "";
  const azureSecretName = process.env.AZURE_SECRET_NAME ? process.env.AZURE_SECRET_NAME : "";
  // 並列で2個取得させる
  const [db, azure] = await Promise.all([
    getSecretValue(dbAccessSecretName),
    getSecretValue(azureSecretName)
  ])

  const dbAccessSecretValue = db as DbAccessSecretValue;
  const azureSecretValue = azure as AzureSecretValue;
  return { dbAccessSecretValue, azureSecretValue };
}

/**
 * PGVectorStoreのインスタンス生成
 * @param dbConfig 
 * @param options 
 * @returns PGVectorStore
 */
export const pgVectorInitialize = async (dbConfig: ClientConfig, options: pgVectorInitializeOptions) => {
  let embeddings;
  if (options.openAiApiKey) {
    embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002",
      openAIApiKey: options.openAiApiKey,
    });
  } else if (options.azureSecretValue) {
    embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002",
      azureOpenAIApiKey: options.azureSecretValue.azureOpenAIApiKey,
      azureOpenAIApiVersion: options.azureSecretValue.azureOpenAIEmbeddingApiVersion,
      azureOpenAIApiInstanceName: options.azureSecretValue.azureOpenAIApiInstanceName,
      azureOpenAIApiDeploymentName: options.azureSecretValue.azureOpenAIEmbeddingApiDeploymentName,
    });
  }
  else {
    throw "azureSecretかopenAiApiKeyの指定が必要";
  }

  return await PGVectorStore.initialize(
    embeddings,
    {
      postgresConnectionOptions: dbConfig,
      collectionTableName: "langchain_embedding_collection",
      collectionName: "kintone_codeTemplate",
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
