import { Response, Request } from "express"
import { Client } from "pg";
import * as crypto from 'crypto'
import { z } from "zod";
import { InsertRequestBody, InsertRequestBodySchema } from "./schema"
import { insertTemplateCode, deleteTemplateCode, deleteLangchainEmbeddingCollection } from "./dao";
import { pgVectorInitialize } from "../common";
import { ErrorCode } from "../constants";
import { getDbConfig, getSecretValues, ValidationError, RequestHeaderName } from "../../../utils";
import { Document } from "langchain/document";

export const insertHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A05199;

  try {
    subscriptionId = req.header(RequestHeaderName.aa4kSubscriptionId) as string;
    body = (req.body ? JSON.parse(req.body) : {}) as InsertRequestBody;
    const { templateCodes, refresh } = body;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, body);

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

    // データリフレッシュの場合
    if (refresh) {
      // template削除
      await deleteTemplateCode(dbClient, "kintone_codeTemplate")
      // collection削除
      await deleteLangchainEmbeddingCollection(dbClient, "kintone_codeTemplate")
    }

    // pgvectorStoreの初期設定
    const pgvectorStore = await pgVectorInitialize(dbConfig, { azureSecretValue })

    // collection作成
    pgvectorStore.getOrCreateCollection();

    // リクエストパラメータ分ループ
    let documents: Document[] = [];
    for (const templateCode of templateCodes) {
      const targetTemplateCode = isBase64(templateCode.templateCode) ? Buffer.from(templateCode.templateCode, "base64").toString("utf-8") : templateCode.templateCode;
      const uuid = crypto.randomUUID();
      // ベクター登録する情報
      const document = new Document({ pageContent: templateCode.templateCodeDescription, metadata: { templateCodeId: uuid, } })
      // pgvectorStoreへの登録
      await pgvectorStore.addDocuments([document]);
      // SQL クエリの実行
      await insertTemplateCode(dbClient, uuid, targetTemplateCode)
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
    if (err instanceof ValidationError) {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      retErrorCode = ErrorCode.A05101;
    }
    res.status(retErrorStatus).json({ message: retErrorMessage, errorCode: retErrorCode });
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
const validateRequestParam = (subscriptionId: string, reqBody: InsertRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    InsertRequestBodySchema.parse(reqBody);

  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}

const isBase64 = (str: string) => {
  try {
    Buffer.from(str, 'base64');
    return true;
  } catch (err) {
    return false;
  }
};
