import Redis from 'ioredis';
import { Client } from "pg";
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from "zod";
import { ErrorCode } from "./constants";
import {
  getSecretValues
  , ValidationError
  , RequestHeaderName
  , getRedisConfig
  , DbAccessSecretValue
  , getDbConfig
} from "../../../../utils";
import { PromptRequestBodySchema, PromptRequestBody } from "./schema";
import { selectPromptInfo } from "./dao";
import { PromptInfo } from "./type"
import { addDays, differenceInSeconds } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

/**
 * プロンプト取得API
 * @param event 
 * @param context 
 * @returns 
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subscriptionId;
  let pluginVersion;
  let body;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A09099;
  try {
    subscriptionId = event.headers[RequestHeaderName.aa4kSubscriptionId] as string;
    pluginVersion = event.headers[RequestHeaderName.aa4kPluginVersion] as string;
    body = (event.body ? JSON.parse(event.body) : {}) as PromptRequestBody;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, pluginVersion, body)

    // 開始ログの出力
    const startLog = {
      message: "プロンプト取得API開始",
      subscriptionId: subscriptionId,
      pluginVersion: pluginVersion,
    };
    console.info(startLog);

    // Secret Manager情報の取得(DB_ACCESS_SECRET)
    const { dbAccessSecretValue } = await getSecretValues();

    // プロンプト情報の取得
    const promptInfo = await getPrompt(body.serviceDivList, pluginVersion, dbAccessSecretValue)
    if (!promptInfo) {
      const errorMessage = ({
        subscriptionId: subscriptionId,
        pluginVersion: pluginVersion,
        error: "PromptData is Not Found",
      });
      console.error(errorMessage);
      response = {
        statusCode: 404,
        body: JSON.stringify({ message: "PromptData is Not Found", errorCode: ErrorCode.A09002 }),
      };
      return response;
    }

    // 結果の設定
    response = {
      statusCode: 200,
      body: JSON.stringify({ promptInfoList: promptInfo }),
    };

  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subscriptionId: subscriptionId,
      pluginVersion: pluginVersion,
      error: err,
    });
    console.error(errorMessage);
    if (err instanceof ValidationError) {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      retErrorCode = ErrorCode.A09001;
    }
    response = {
      statusCode: retErrorStatus,
      body: JSON.stringify({ message: retErrorMessage, errorCode: retErrorCode })
    };
  }
  return response;
};


/**
 * リクエストパラメータのバリデーション
 * @param subscriptionId 
 * @param pluginVersion 
 */
const validateRequestParam = (subscriptionId: string, pluginVersion: string, reqBody: PromptRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ヘッダー.プラグインバージョン
    const pluginVersionSchema = z.string();
    pluginVersionSchema.parse(pluginVersion);
    // ボディ
    PromptRequestBodySchema.parse(reqBody);

  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}


/**
 * プロンプト情報の取得
 * @param serviceDivList
 * @param pluginVersion
 * @param dbAccessSecretValue 
 */
const getPrompt = async (serviceDivList: string[], pluginVersion: string, dbAccessSecretValue: DbAccessSecretValue) => {
  let dbClient: Client | undefined;
  let redisClient: Redis | undefined;

  try {
    // redis接続情報
    const redisConfig = getRedisConfig();
    // redis接続
    redisClient = new Redis(redisConfig);

    // Redisキー
    const redisKey = `prompt_${pluginVersion}`;
    // プロンプト情報の取得（from Redis）
    const promptInfoList = await redisClient.get(redisKey);
    if (!promptInfoList) {
      // 取得できなかった場合、DBより情報を取得
      // データベース接続情報
      const dbConfig = getDbConfig(dbAccessSecretValue)
      // データベース接続
      dbClient = new Client(dbConfig);
      await dbClient.connect();

      // プロンプト情報の取得
      const latestPromptInfoList = await selectPromptInfo(dbClient, serviceDivList, pluginVersion);
      if (latestPromptInfoList.rowCount === null || latestPromptInfoList.rowCount === 0) {
        return null;
      }

      // // DBから取得した情報をRedisに登録
      await redisClient.set(redisKey, JSON.stringify(latestPromptInfoList.rows));
      await redisClient.expire(redisKey, getExpirationTime());
      return latestPromptInfoList.rows;
    } else {
      return JSON.parse(promptInfoList) as PromptInfo[];
    }

  } finally {
    if (dbClient) {
      // データベース接続を閉じる
      await dbClient.end();
    }
    if (redisClient) {
      // Redis接続を閉じる
      await redisClient.quit();
    }
  }
}


/**
 * Redisの有効期限の取得
 * @returns 今日の残り時間（秒単位）
 */
const getExpirationTime = () => {
  const timeZone = 'Asia/Tokyo';

  // UTCの現在時刻を取得
  const nowUtc = new Date();
  // UTCの明日の日付を取得
  const tomorrowUtc = addDays(new Date(nowUtc.getFullYear(), nowUtc.getMonth(), nowUtc.getDate()), 1);

  // UTCから日本時間に変換
  const nowJST = utcToZonedTime(nowUtc, timeZone);
  const tomorrowJST = utcToZonedTime(tomorrowUtc, timeZone);

  // 今日の残り時間（秒単位）を算出する
  const diffSecond = differenceInSeconds(tomorrowJST, nowJST);

  return diffSecond;
}
