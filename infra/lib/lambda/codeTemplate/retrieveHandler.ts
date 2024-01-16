import { Response, Request } from "express"
import { Client } from "pg";
import { z } from "zod";
import { RetrieveRequestBody, RetrieveRequestBodySchema } from "./type"
import { selectTmplateCode } from "./dao";
import { getSecretValues, pgVectorInitialize } from "./common";
import { getDbConfig } from "../utils";
import { checkPluginVersion } from "../utils/versionCheck";

export const retrieveHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";

  try {
    subscriptionId = req.header("aa4k-subscription-id") as string;
    const openAiApiKey = req.header("aa4k-api-key") as string;
    const pluginVersion = req.header("aa4k-plugin-version") as string;
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

    // Secret Manager情報の取得(DB_ACCESS_SECRET, AZURE_SECRET)
    const { dbAccessSecretValue, azureSecretValue } = await getSecretValues()

    // プラグインバージョンチェック
    const isVersionOk = await checkPluginVersion(pluginVersion, dbAccessSecretValue);
    if (!isVersionOk) {
      res.status(422).json({ message: "Unsupported Version" });
      return;
    }

    // データベース接続情報
    const dbConfig = getDbConfig(dbAccessSecretValue)
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // pgvectorStoreの初期設定
    const pgvectorStore = await pgVectorInitialize(dbConfig, { azureSecretValue, openAiApiKey })

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