import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { Client } from "pg";
import { format, utcToZonedTime } from 'date-fns-tz';

import { LogLangchainRequestheaders, LogLangchainRequestBody, InsertLangchainProcessLogProps } from "./type";
import { insertLangchainProcessLog } from "./sql";

const secretsManagerClient = new SecretsManagerClient();

/**
 * Langchain処理ログ登録API
 * @param event 
 * @param context 
 * @returns 
 */
exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subscription_id;
  let dbClient;
  try {
    const headers = event.headers as LogLangchainRequestheaders;
    const body = (event.body ? JSON.parse(event.body) : {}) as LogLangchainRequestBody;
    subscription_id = headers.subscription_id;

    // 開始ログの出力
    const startLog = {
      message: "Langchain処理ログ登録API開始",
      subscription_id: subscription_id,
    };
    console.info(startLog);

    // 現在日時の取得
    const currentDate = await getCurrentDateStr();
    // Secret Manager情報の取得
    const secretValue = await getSecretValue();

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
      subscription_id,
      LogLangchainRequestBody: body,
      currentDate
    } as InsertLangchainProcessLogProps;
    const res = await insertLangchainProcessLog(dbClient, props)

    // データベース接続を閉じる
    await dbClient.end();

    response = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success', }),
    };
  } catch (err: unknown) {
    if (dbClient) {
      // データベース接続を閉じる
      await dbClient.end();
    }

    // エラーログの出力
    const errorMessage = ({
      subscription_id: subscription_id,
      error: err,
    });
    console.error(errorMessage);
    response = {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
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
  const secret_name = process.env.DB_ACCESS_SECRET_NAME;
  // Secret Managerから情報取得
  const result = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
  // 取得できない場合はエラー
  if(!result.SecretString) throw 'raise Internal server error';

  const SecretValue = JSON.parse(result.SecretString);
  return SecretValue;
}

