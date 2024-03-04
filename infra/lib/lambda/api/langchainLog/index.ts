import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Client } from "pg";
import { format, utcToZonedTime } from 'date-fns-tz';
import { z } from "zod";
import { LogLangchainRequestBodySchema, LogLangchainRequestBody, InsertLangchainProcessLogProps } from "./schema";
import { insertLangchainProcessLog } from "./dao";
import { ErrorCode } from "./constants";
import { getSecretValues, getDbConfig, ValidationError, RequestHeaderName, getSubscriptionData, changeSchemaSearchPath } from "../../utils";

/**
 * Langchain処理ログ登録API
 * @param event 
 * @param context 
 * @returns 
 */
exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subscriptionId;
  let pluginVersion;
  let body;
  let dbClient;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A06099;
  try {
    subscriptionId = event.headers[RequestHeaderName.aa4kSubscriptionId] as string;
    pluginVersion = event.headers[RequestHeaderName.aa4kPluginVersion] as string;
    body = (event.body ? JSON.parse(event.body) : {}) as LogLangchainRequestBody;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, pluginVersion, body);

    // 開始ログの出力
    const startLog = {
      message: "Langchain処理ログ登録API開始",
      subscriptionId: subscriptionId,
    };
    console.info(startLog);

    // 現在日時の取得
    const currentDate = await getCurrentDateStr();
    // Secret Manager情報の取得(DB_ACCESS_SECRET)
    const { dbAccessSecretValue } = await getSecretValues();

    // サブスクリプション情報の取得
    const subscriptionData = await getSubscriptionData(subscriptionId, dbAccessSecretValue);
    if (!subscriptionData) {
      retErrorStatus = 404;
      retErrorMessage = "SubscriptionData is Not Found";
      retErrorCode = ErrorCode.A06002;
      throw new Error(retErrorMessage)
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

    // SQL クエリの実行
    const props = {
      subscriptionId,
      body,
      currentDate
    } as InsertLangchainProcessLogProps;
    await insertLangchainProcessLog(dbClient, props)

    response = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success', }),
    };
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
      retErrorCode = ErrorCode.A06001;
    }
    response = {
      statusCode: retErrorStatus,
      body: JSON.stringify({ message: retErrorMessage, errorCode: retErrorCode })
    };
  } finally {
    if (dbClient) {
      // データベース接続を閉じる
      await dbClient.end();
    }
  }
  return response;
};

/**
 * 現在日時の取得
 * @returns 現在日時
 */
const getCurrentDateStr = () => {

  const timeZone = 'Asia/Tokyo';

  // UTCの現在時刻を取得
  const nowUtc = new Date();

  // UTCから日本時間に変換
  const nowJST = utcToZonedTime(nowUtc, timeZone);

  // フォーマットを指定して文字列に変換
  const formattedJST = format(nowJST, 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone });

  return formattedJST;
}

/**
 * リクエストパラメータのバリデーション
 */
const validateRequestParam = (subscriptionId: string, pluginVersion: string, reqBody: LogLangchainRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    LogLangchainRequestBodySchema.parse(reqBody);

  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}