import { Response, Request } from "express"
import { Client } from "pg";
import { z } from "zod";
import { Document } from "@langchain/core/documents";
import { EnsembleRetriever } from "./ensemble"
import { SuguresRetriever } from "./sugures"
import { PgVectorRetriever } from "./pgvector"
import { RetrieveRequestBody, RetrieveRequestBodySchema } from "./schema"
import { selectTemplateCode } from "./dao";
import { pgVectorInitialize } from "../common";
import { ErrorCode } from "../constants";
import { getDbConfig, getSecretValues, getParameterValues, ValidationError, RequestHeaderName, getSubscriptionData, getContractStatus, ContractStatus } from "../../../utils";
import { InvalidOpenAiApiKeyError } from "./errors"

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

    // 並列でSecret Manager情報とParameter Store情報を取得させる
    const [secret, parameter] = await Promise.all([
      getSecretValues(),
      getParameterValues(),
    ]);
    const azureSecretValue = secret.azureSecretValue;
    const dbAccessSecretValue = secret.dbAccessSecretValue;
    const aa4kConstParameterValue = parameter.aa4kConstParameterValue;

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
    const pgvectorStore = await pgVectorInitialize(dbConfig, { azureSecretValue, openAiApiKey: contractStatus === ContractStatus.trial ? openAiApiKey : undefined });

    const pgvectorRetriever = new PgVectorRetriever(pgvectorStore, subscriptionId, aa4kConstParameterValue.retrieveScoreThreshold, aa4kConstParameterValue.retrieveMaxCount);
    const suguresRetriever = new SuguresRetriever(subscriptionId, body.conversationId);
    const ensemble = new EnsembleRetriever({ retrievers: [suguresRetriever, pgvectorRetriever], weights: [0.5, 0.5] })
    const documents = await ensemble.getRelevantDocuments(body.query)
      .catch(err => {
        if (err instanceof InvalidOpenAiApiKeyError) {
          retErrorStatus = 401;
          retErrorMessage = "Invalid OpenAI Api Key";
          retErrorCode = ErrorCode.A05003;
        }
        throw err
      })


    // コードテンプレートの取得
    for (const doc of documents) {
      const templateCodeId = doc.metadata.templateCodeId;
      // SQL クエリの実行（取得したtemplateCodeIdに該当するコードを取得）
      const result = await selectTemplateCode(dbClient, templateCodeId);
      // 取得したコードをオブジェクトに追加
      const templateCode = result.rows[0] ? result.rows[0].template_code : "";
      doc.metadata.templateCode = templateCode
    }
    // 結果編集
    const resultDocuments = documents
      .filter((doc) => doc.metadata.templateCode)
      .map((doc) => {
        const metaData = doc.metadata;
        return new Document({ pageContent: metaData.templateCode })
      });

    // 終了
    res.status(200).json({ documents: resultDocuments });
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