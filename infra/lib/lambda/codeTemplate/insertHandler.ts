import { Response, Request } from "express"
import { Client } from "pg";
import * as crypto from 'crypto'
import { z } from "zod";
import { InsertRequestBody, InsertRequestBodySchema } from "./type"
import { insertTmplateCode } from "./dao";
import { getSecretValues, pgVectorInitialize } from "./common";
import { getDbConfig } from "../utils";
import { Document } from "langchain/document";

export const insertHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";

  try {
    subscriptionId = req.header("aa4k-subscription-id") as string;
    body = (req.body ? JSON.parse(req.body) : {}) as InsertRequestBody;
    const { templateCodes } = body;
    // リクエストのバリデーション
    await validateRequestParam(subscriptionId, body).catch(async (err) => {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      throw err;
    });

    // 開始ログの出力
    const startLog = {
      message: "コードテンプレート管理API(登録)開始",
      subscriptionId: subscriptionId,
    };
    console.info(startLog);

    // Secret Manager情報の取得(DB_ACCESS_SECRET, AZURE_SECRET)
    const { dbAccessSecretValue, azureSecretValue } = await getSecretValues()

    // データベース接続情報
    const dbConfig = getDbConfig(dbAccessSecretValue)
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // pgvectorStoreの初期設定
    const pgvectorStore = await pgVectorInitialize(dbConfig, { azureSecretValue })

    // collection作成
    pgvectorStore.getOrCreateCollection();

    // リクエストパラメータ分ループ
    let documents: Document[] = [];
    for (const templateCode of templateCodes) {
      const uuid = crypto.randomUUID();
      // ベクター登録する情報
      const document = new Document({ pageContent: templateCode.templateCodeDescription, metadata: { templateCodeId: uuid, } })
      // pgvectorStoreへの登録
      await pgvectorStore.addDocuments([document]);
      // SQL クエリの実行
      await insertTmplateCode(dbClient, uuid, templateCode.templateCode)
      documents.push(document)
    }

    // 終了
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
const validateRequestParam = async (subscriptionId: string, reqBody: InsertRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    InsertRequestBodySchema.parse(reqBody);

  } catch (err) {
    throw err;
  }
}