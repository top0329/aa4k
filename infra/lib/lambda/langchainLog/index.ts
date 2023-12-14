import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { Client } from "pg";
import { format, utcToZonedTime } from 'date-fns-tz';
import { z } from "zod";

import { LogLangchainRequestBodySchema, LogLangchainRequestheaders, LogLangchainRequestBody, InsertLangchainProcessLogProps } from "./type";
import { insertLangchainProcessLog } from "./dao";

const secretsManagerClient = new SecretsManagerClient();

/**
 * Langchain処理ログ登録API
 * @param event 
 * @param context 
 * @returns 
 */
exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subscriptionId;
  let body;
  let dbClient;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  try {
    const headers = event.headers as LogLangchainRequestheaders;
    subscriptionId = headers.subscription_id;
    body = (event.body ? JSON.parse(event.body) : {}) as LogLangchainRequestBody;
    // リクエストのバリデーション
    await validationRequestParam(subscriptionId, body).catch(async (err) => {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      throw err;
    });


    // 開始ログの出力
    const startLog = {
      message: "Langchain処理ログ登録API開始",
      subscriptionId: subscriptionId,
    };
    console.info(startLog);

    // 現在日時の取得
    const currentDate = await getCurrentDateStr();
    // Secret Manager情報の取得
    const secretValue = await getSecretValue().catch(async (err) => {
      throw err;
    });

    // データベース接続
    const dbConfig = {
      host: process.env.RDS_PROXY_ENDPOINT,
      database: secretValue.dbname,
      user: secretValue.username,
      password: secretValue.password,
      port: secretValue.port,
      ssl: true,
    };
    dbClient = new Client(dbConfig);
    // データベース接続を開始する
    await dbClient.connect();

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
  } catch (err: unknown) {
    // エラーログの出力
    const errorMessage = ({
      subscriptionId: subscriptionId,
      body: body,
      error: err,
    });
    console.error(errorMessage);
    response = {
      statusCode: retErrorStatus,
      body: JSON.stringify({ message: retErrorMessage })
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
 * Secret Manager情報の取得
 * @returns Secret Manager情報
 */
const getSecretValue = async () => {
  // 環境変数からSecretManagerのnameを取得
  const secretName = process.env.DB_ACCESS_SECRET_NAME;
  // Secret Managerから情報取得
  const result = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: secretName,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
  // 取得できない場合はエラー
  if (!result.SecretString) throw 'Secret value is empty';

  const SecretValue = JSON.parse(result.SecretString);
  return SecretValue;
}

/**
 * リクエストパラメータのバリデーション
 */
const validationRequestParam = async (subscriptionId: string, reqBody: LogLangchainRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    LogLangchainRequestBodySchema.parse(reqBody);

  } catch (err: unknown) {
    throw err;
  }
}