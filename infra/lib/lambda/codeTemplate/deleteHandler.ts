import { Response, Request } from "express"
import { Client } from "pg";
import { z } from "zod";
import { DeleteRequestBody, DeleteRequestBodySchema } from "./type"
import { deleteTmplateCode } from "./dao";
import { getSecretValues, pgVectorInitialize } from "./common";
import { getDbConfig } from "../utils";

export const deleteHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";

  try {
    subscriptionId = req.header("aa4k-subscription-id") as string;
    body = (req.body ? JSON.parse(req.body) : {}) as DeleteRequestBody;
    const { templateCodeIds } = body;
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
    for (const templateCodeId of templateCodeIds) {
      // --------------------
      // 削除
      // --------------------
      // テンプレートコードTBL削除
      await deleteTmplateCode(dbClient, templateCodeId)
      // langChain_EmbeddingTBL削除
      await pgvectorStore.delete({ filter: { templateCodeId: templateCodeId } })
    }

    // 終了
    res.status(200).json({ body });
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
const validateRequestParam = async (subscriptionId: string, reqBody: DeleteRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    DeleteRequestBodySchema.parse(reqBody);

  } catch (err) {
    throw err;
  }
}