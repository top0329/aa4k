import { Context, APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyEventHeaders } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { Client } from "pg";
import { format, utcToZonedTime } from 'date-fns-tz';

import { insertLangchainProcessLog } from "./sql";

const secretsManagerClient = new SecretsManagerClient({
  region: "ap-northeast-1",
});

interface LogLangchainRequestheaders extends APIGatewayProxyEventHeaders {
  subscription_id: string,
}
interface LogLangchainRequestBody {
  history_id: string,
  session_id: string,
  handle_name: string,
  run_name: string,
  run_id: string,
  parent_run_id?: string,
  content: string,
  metadata_lang_chain_params?: string,
  metadata_extra_params?: string,
  tokens: string,
}

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
    const currentDate = await getCurrentDate();
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
    const pram = [
      subscription_id,    // subscription_id
      body.history_id ? body.history_id : null,    // history_id
      body.session_id ? body.session_id : null,    // session_id
      body.handle_name ? body.handle_name : null,   // handle_name
      body.run_name ? body.run_name : null,    // run_name
      body.run_id ? body.run_id : null,    // run_id
      body.parent_run_id ? body.parent_run_id : null,   // parent_run_id
      body.content ? body.content : null,   // content
      body.metadata_lang_chain_params ? body.metadata_lang_chain_params : null,    // metadata_lang_chain_params
      body.metadata_extra_params ? body.metadata_extra_params : null,   // metadata_extra_params
      body.tokens ? body.tokens : null,    // tokens
      currentDate,
    ]
    const res = await insertLangchainProcessLog(dbClient, pram)

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
const getCurrentDate = () => {

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
 * @returns 現在日時
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
  const SecretValue = result.SecretString ? JSON.parse(result.SecretString) : {};
  return SecretValue;
}

