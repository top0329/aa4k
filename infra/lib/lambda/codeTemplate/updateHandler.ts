import { Response, Request } from "express"
import { Client } from "pg";
import { z } from "zod";
import { UpdateRequestBody, UpdateRequestBodySchema } from "./type"
import { updateTmplateCode } from "./dao";
import { getSecretValue, getDbConfig, pgVectorInitialize } from "./common"
import { Document } from "langchain/document";

export const updateHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";

  try {
    subscriptionId = req.header("subscription_id") as string;
    body = (req.body ? JSON.parse(req.body) : {}) as UpdateRequestBody;
    // リクエストのバリデーション
    await validateRequestParam(subscriptionId, body).catch(async (err) => {
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

    // データベース接続情報
    const dbConfig = await getDbConfig(dbAccessSecretValue)
    // データベース接続情報
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // pgvectorStoreの初期設定
    const pgvectorStore = await pgVectorInitialize(dbConfig, azureSecretValue)

    // リクエストパラメータ分ループ
    let documents: Document[] = [];
    for (const obj of body) {
      // --------------------
      // 更新・削除
      // --------------------
      // テンプレートコードTBL更新
      await updateTmplateCode(dbClient, obj.templateCodeId, obj.templateCode)
      // langChain_EmbeddingTBL削除
      await pgvectorStore.delete({ filter: { templateCodeId: obj.templateCodeId } })

      // --------------------
      // 登録
      // --------------------
      // ベクター登録する情報
      const document = [
        { pageContent: obj.templateCodeDescription, metadata: { templateCodeId: obj.templateCodeId, } }
      ] as Document[];
      documents.push(document[0])
      // pgvectorStoreへの登録
      await pgvectorStore.addDocuments(document);
    }

    res.status(200).json({ documents });
  } catch (err) {
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
 * リクエストパラメータのバリデーション
 * @param subscriptionId 
 * @param reqBody 
 */
const validateRequestParam = async (subscriptionId: string, reqBody: UpdateRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    UpdateRequestBodySchema.parse(reqBody);

  } catch (err) {
    throw err;
  }
}