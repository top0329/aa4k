import { Response, Request } from "express"
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PGVectorStore } from "langchain/vectorstores/pgvector";
import { Client } from "pg";
import { z } from "zod";
import { DeleteRequestBody, DeleteRequestBodySchema } from "../type"
import { deleteTmplateCode, deleteLangchainEmbedding } from "./dao";

const secretsManagerClient = new SecretsManagerClient();

export const deleteHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let body;
  let dbClient;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";

  try {
    subscriptionId = req.header("subscription_id") as string;
    body = (req.body ? JSON.parse(req.body) : {}) as DeleteRequestBody;
    // リクエストのバリデーション
    await validationRequestParam(subscriptionId, body).catch(async (err) => {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      throw err;
    });

    // 開始ログの出力
    const startLog = {
      message: "コードテンプレート管理API(更新)開始",
      subscriptionId: subscriptionId,
    };
    console.info(startLog);

    // Secret Manager情報の取得(DB_ACCESS_SECRET_NAME)
    const dbAccessSecretName = process.env.DB_ACCESS_SECRET_NAME ? process.env.DB_ACCESS_SECRET_NAME : "";
    const dbAccessSecretValue = await getSecretValue(dbAccessSecretName).catch(async (err) => {
      throw err;
    });
    // Secret Manager情報の取得(AZURE_SECRET_NAME)
    const azureSecretName = process.env.AZURE_SECRET_NAME ? process.env.AZURE_SECRET_NAME : "";
    const azureSecretValue = await getSecretValue(azureSecretName).catch(async (err) => {
      throw err;
    });

    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002",
      azureOpenAIApiKey: azureSecretValue.azureOpenAIApiKey,
      azureOpenAIApiVersion: azureSecretValue.azureOpenAIEmbeddingApiVersion,
      azureOpenAIApiInstanceName: azureSecretValue.azureOpenAIApiInstanceName,
      azureOpenAIApiDeploymentName: azureSecretValue.azureOpenAIEmbeddingApiDeploymentName,
    })

    // データベース接続情報
    const dbConfig = {
      type: dbAccessSecretValue.engine,
      host: process.env.RDS_PROXY_ENDPOINT,
      database: dbAccessSecretValue.dbname,
      user: dbAccessSecretValue.username,
      password: dbAccessSecretValue.password,
      port: dbAccessSecretValue.port,
      ssl: true,
    };
    // データベース接続情報
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // リクエストパラメータ分ループ
    for (const obj of body) {
      // --------------------
      // 削除
      // --------------------
      // テンプレートコードTBL削除
      await deleteTmplateCode(dbClient, obj.templateCodeId)
      // langChain_EmbeddingTBL削除
      await deleteLangchainEmbedding(dbClient, obj.templateCodeId)
    }

    res.status(200).json({ body });
  } catch (err: unknown) {
    // エラーログの出力
    const errorMessage = ({
      subscriptionId: subscriptionId,
      body: body,
      error: err,
    });
    console.error(errorMessage);
    res.status(retErrorStatus).json({ message: retErrorMessage });
  } finally {
    if (dbClient) {
      // データベース接続を閉じる
      await dbClient.end();
    }
  }
}




/**
 * Secret Manager情報の取得
 * @param secretName 
 * @returns Secret Manager情報
 */
const getSecretValue = async (secretName: string) => {
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
 * リクエストパラメータのバリデーション
 * @param subscriptionId 
 * @param reqBody 
 */
const validationRequestParam = async (subscriptionId: string, reqBody: DeleteRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    DeleteRequestBodySchema.parse(reqBody);

  } catch (err: unknown) {
    throw err;
  }
}