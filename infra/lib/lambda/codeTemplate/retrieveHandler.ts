import { Response, Request } from "express"
import { Client } from "pg";
import { z } from "zod";
import { RetrieveRequestBody, RetrieveRequestBodySchema } from "./type"
import { selectTmplateCode } from "./dao";
import { getSecretValue, getDbConfig, pgVectorInitialize } from "./common"

export const retrieveHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";

  try {
    subscriptionId = req.header("subscription_id") as string;
    const apiKey = req.header("api_key") as string;
    body = (req.body ? JSON.parse(req.body) : {}) as RetrieveRequestBody;
    // リクエストのバリデーション
    await validateRequestParam(subscriptionId, body).catch(async (err) => {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      throw err;
    });

    // 開始ログの出力
    const startLog = {
      message: "コードテンプレート管理API(retriever)開始",
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
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // pgvectorStoreの初期設定
    const pgvectorStore = await pgVectorInitialize(dbConfig, azureSecretValue, apiKey)

    // pgvectorStoreを使用して検索
    const documents = await pgvectorStore.similaritySearchWithScore(body.query, body.k);

    for (const [doc, num] of documents) {
      const templateCodeId = doc.metadata.templateCodeId;
      // SQL クエリの実行（取得したtemplateCodeIdに該当するコードを取得）
      const result = await selectTmplateCode(dbClient, templateCodeId);
      // 取得したコードをオブジェクトに追加
      const templateCode = result.rows[0].template_code
      doc.metadata.templateCode = templateCode
    }

    // 完了
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
const validateRequestParam = async (subscriptionId: string, reqBody: RetrieveRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    RetrieveRequestBodySchema.parse(reqBody);

  } catch (err) {
    throw err;
  }
}