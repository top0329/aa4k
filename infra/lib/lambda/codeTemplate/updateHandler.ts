import { Response, Request } from "express"
import { Client } from "pg";
import { z } from "zod";
import { UpdateRequestBody, UpdateRequestBodySchema } from "./type"
import { updateTmplateCode } from "./dao";
import { getSecretValues, getDbConfig, pgVectorInitialize } from "./common"
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
    const { templateCodes } = body;
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

    // Secret Manager情報の取得(DB_ACCESS_SECRET, AZURE_SECRET)
    const { dbAccessSecretValue, azureSecretValue } = await getSecretValues()

    // データベース接続情報
    const dbConfig = getDbConfig(dbAccessSecretValue)
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // pgvectorStoreの初期設定
    const pgvectorStore = await pgVectorInitialize(dbConfig, { azureSecretValue })

    // リクエストパラメータ分ループ
    let documents: Document[] = [];
    for (const templateCode of templateCodes) {
      // --------------------
      // 更新・削除
      // --------------------
      // テンプレートコードTBL更新
      await updateTmplateCode(dbClient, templateCode.templateCodeId, templateCode.templateCode)
      // langChain_EmbeddingTBL削除
      await pgvectorStore.delete({ filter: { templateCodeId: templateCode.templateCodeId } })

      // --------------------
      // 登録
      // --------------------
      // ベクター登録する情報
      const document = new Document({ pageContent: templateCode.templateCodeDescription, metadata: { templateCodeId: templateCode.templateCodeId, } })
      // pgvectorStoreへの登録
      await pgvectorStore.addDocuments([document]);
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