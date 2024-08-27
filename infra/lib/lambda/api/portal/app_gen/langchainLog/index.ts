import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Client } from "pg";
import { format, utcToZonedTime } from 'date-fns-tz';
import { z } from "zod";
import { LogLangchainRequestBodySchema, LogLangchainRequestBody, InsertLangchainProcessLogProps } from "./schema";
import { insertLangchainProcessLog } from "./dao";
import { ErrorCode } from "./constants";
import { getSecretValues, getDbConfig, ValidationError, RequestHeaderName, getSubdomainData, changeSchemaSearchPath } from "../../../../utils";

/**
 * Langchain処理ログ登録API
 * @param event 
 * @param context 
 * @returns 
 */
exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subdomain;
  let checkPortalJsVersion;
  let body;
  let dbClient;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A106099;
  try {
    subdomain = event.headers[RequestHeaderName.aa4kSubdomain] as string;
    checkPortalJsVersion = event.headers[RequestHeaderName.aa4kPortalJsVersion] as string;
    body = (event.body ? JSON.parse(event.body) : {}) as LogLangchainRequestBody;
    // リクエストのバリデーション
    validateRequestParam(subdomain, body);

    // 開始ログの出力
    const startLog = {
      message: "Langchain処理ログ登録(アプリ生成用)API開始",
      subdomain: subdomain,
    };
    console.info(startLog);

    // 現在日時の取得
    const currentDate = await getCurrentDateStr();
    // Secret Manager情報の取得(DB_ACCESS_SECRET)
    const { dbAccessSecretValue } = await getSecretValues();

    // サブドメイン情報の取得
    const subdomainData = await getSubdomainData(subdomain, dbAccessSecretValue);
    if (!subdomainData) {
      retErrorStatus = 404;
      retErrorMessage = "SubdomainData is Not Found";
      retErrorCode = ErrorCode.A106002;
      throw new Error(retErrorMessage)
    }
    // スキーマ名
    const schema = subdomainData.schema_name;

    // データベース接続情報
    const dbConfig = getDbConfig(dbAccessSecretValue)
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // スキーマ検索パスを変更
    await changeSchemaSearchPath(dbClient, schema);

    // SQL クエリの実行
    const props = {
      subdomain,
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
      subdomain: subdomain,
      body: body,
      error: err,
    });
    console.error(errorMessage);
    if (err instanceof ValidationError) {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      retErrorCode = ErrorCode.A106001;
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
const validateRequestParam = (subdomain: string, reqBody: LogLangchainRequestBody) => {
  try {
    // ヘッダー.サブドメイン
    const subdomainSchema = z.string();
    subdomainSchema.parse(subdomain);
    // ボディ
    LogLangchainRequestBodySchema.parse(reqBody);

  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}