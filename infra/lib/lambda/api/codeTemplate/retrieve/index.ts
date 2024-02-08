import { Response, Request } from "express"
import { Client } from "pg";
import { z } from "zod";
import { RetrieveRequestBody, RetrieveRequestBodySchema } from "./schema"
import { selectTemplateCode } from "./dao";
import { pgVectorInitialize } from "../common";
import { ErrorCode } from "../constants";
import { getDbConfig, getSecretValues, ValidationError, RequestHeaderName, getSubscriptionData, getContractStatus, ContractStatus } from "../../../utils";

export const retrieveHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A05099;

  try {
    subscriptionId = req.header(RequestHeaderName.aa4kSubscriptionId) as string;
    const openAiApiKey = req.header(RequestHeaderName.aa4kApiKey) as string;
    const pluginVersion = req.header(RequestHeaderName.aa4kPluginVersion) as string;
    body = (req.body ? JSON.parse(req.body) : {}) as RetrieveRequestBody;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, body);

    // 開始ログの出力
    const startLog = {
      message: "コードテンプレート管理API(retriever)開始",
      subscriptionId: subscriptionId,
    };
    console.info(startLog);

    // Secret Manager情報の取得(DB_ACCESS_SECRET, AZURE_SECRET)
    const { dbAccessSecretValue, azureSecretValue } = await getSecretValues()

    // サブスクリプション情報の取得
    const subscriptionData = await getSubscriptionData(subscriptionId, dbAccessSecretValue);
    if (!subscriptionData) {
      retErrorStatus = 404;
      retErrorMessage = "SubscriptionData is Not Found";
      retErrorCode = ErrorCode.A05002;
      throw new Error("SubscriptionData is Not Found")
    }
    // 契約ステータスの取得
    const contractStatus = getContractStatus(subscriptionData)

    // データベース接続情報
    const dbConfig = getDbConfig(dbAccessSecretValue)
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // pgvectorStoreの初期設定 契約ステータスが契約中(trial)の場合のみヘッダのOpenAI API_KEYを渡す
    const pgvectorStore = await pgVectorInitialize(dbConfig, { azureSecretValue, openAiApiKey: contractStatus === ContractStatus.trial ? openAiApiKey : undefined })

    // pgvectorStoreを使用して検索
    const documents = await pgvectorStore.similaritySearchWithScore(body.query, body.k);

    for (const [doc, num] of documents) {
      const templateCodeId = doc.metadata.templateCodeId;
      // SQL クエリの実行（取得したtemplateCodeIdに該当するコードを取得）
      const result = await selectTemplateCode(dbClient, templateCodeId);
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
    if (err instanceof ValidationError) {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      retErrorCode = ErrorCode.A05001;
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
const validateRequestParam = (subscriptionId: string, reqBody: RetrieveRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    RetrieveRequestBodySchema.parse(reqBody);

  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}