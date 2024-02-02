import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ClientConfig } from "pg";
import { PGVectorStore } from "langchain/vectorstores/pgvector";
import { AzureSecretValue } from "../../utils";

interface pgVectorInitializeOptions {
  azureSecretValue?: AzureSecretValue,
  openAiApiKey?: string,
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
