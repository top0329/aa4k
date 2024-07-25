import { Response, Request } from "express";
import { Client } from "pg";
import { z } from "zod";
import { GetCodeRequestBody, GetCodeRequestBodySchema } from "./schema";
import { selectLatestJavascriptCode } from "./dao";
import { ErrorCode } from "../constants";
import { getSecretValues, getDbConfig, ValidationError, RequestHeaderName, getSubscriptionData, changeSchemaSearchPath } from "../../../../../utils";

export const getCodeHandler = async (req: Request, res: Response) => {
  let subscriptionId, subdomain;
  let pluginVersion;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A04099;

  try {
    subscriptionId = req.header(RequestHeaderName.aa4kSubscriptionId) as string;
    subdomain = req.header(RequestHeaderName.aa4kSubdomain) as string;
    pluginVersion = req.header(RequestHeaderName.aa4kPluginVersion) as string;
    body = (req.body ? JSON.parse(req.body) : {}) as GetCodeRequestBody;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, pluginVersion, body);

    // 開始ログの出力
    const startLog = {
      message: "最新JS取得API開始",
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
      retErrorCode = ErrorCode.A04002;
      throw new Error("SubscriptionData is Not Found")
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

    // 最新JSコードの取得
    const queryResult = await selectLatestJavascriptCode(dbClient, body);
    const javascriptCode = queryResult.rows.length > 0 ? queryResult.rows[0].javascript_code : "";

    // 終了
    res.status(200).json({ javascriptCode });
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
      retErrorCode = ErrorCode.A04001;
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
const validateRequestParam = (subscriptionId: string, pluginVersion: string, body: GetCodeRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ヘッダー.プラグインバージョン
    const pluginVersionSchema = z.string();
    pluginVersionSchema.parse(pluginVersion);
    // ボディ
    GetCodeRequestBodySchema.parse(body);
  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}