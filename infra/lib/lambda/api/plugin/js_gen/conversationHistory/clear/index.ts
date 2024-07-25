import { Response, Request } from "express";
import { Client } from "pg";
import { z } from "zod";
import { ClearRequestBody, ClearRequestBodySchema } from "./schema";
import { clearConversationHistory } from "./dao";
import { ErrorCode } from "../constants";
import {
  getSecretValues,
  getDbConfig,
  ValidationError,
  RequestHeaderName,
  getSubscriptionData,
  changeSchemaSearchPath,
} from "../../../../../utils";

export const clearHandler = async (req: Request, res: Response) => {
  let subscriptionId, subdomain;
  let pluginVersion;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A03399;

  try {
    subscriptionId = req.header(RequestHeaderName.aa4kSubscriptionId) as string;
    subdomain = req.header(RequestHeaderName.aa4kSubdomain) as string;
    pluginVersion = req.header(RequestHeaderName.aa4kPluginVersion) as string;
    body = (req.body ? JSON.parse(req.body) : {}) as ClearRequestBody;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, pluginVersion, body);

    // 開始ログの出力
    const startLog = {
      message: "会話履歴API(会話履歴クリア)開始",
      subscriptionId: subscriptionId,
      subdomain: subdomain,
      pluginVersion: pluginVersion,
    };
    console.info(startLog);

    // Secret Manager情報の取得(DB_ACCESS_SECRET)
    const { dbAccessSecretValue } = await getSecretValues();

    // サブスクリプション情報の取得
    const subscriptionData = await getSubscriptionData(subscriptionId, subdomain, dbAccessSecretValue);
    if (!subscriptionData) {
      retErrorStatus = 404;
      retErrorMessage = "SubscriptionData is Not Found";
      retErrorCode = ErrorCode.A03302;
      throw new Error("SubscriptionData is Not Found");
    }
    // スキーマ名
    const schema = subscriptionData.schema_name;

    // データベース接続情報
    const dbConfig = getDbConfig(dbAccessSecretValue)
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // スキーマ検索パスを変更
    await changeSchemaSearchPath(dbClient, schema);

    // 会話履歴のクリア
    await clearConversationHistory(dbClient, body);

    res.status(200).json({ message: 'Success' });
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
      retErrorCode = ErrorCode.A03301;
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
 * @param reqQuery 
 */
const validateRequestParam = (subscriptionId: string, pluginVersion: string, body: ClearRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ヘッダー.プラグインバージョン
    const pluginVersionSchema = z.string();
    pluginVersionSchema.parse(pluginVersion);
    // ボディ
    ClearRequestBodySchema.parse(body);
  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}
