import Redis from 'ioredis';
import { Response, Request } from "express";
import { Client } from "pg";
import { z } from "zod";
import { UpdateUserRatingRequestBody, UpdateUserRatingRequestBodySchema } from "./schema";
import { updateUserRating, updateUserRatingComment } from "./dao";
import { ErrorCode } from "../constants";
import {
  getSecretValue,
  DbAccessSecretValue,
  getDbConfig,
  ValidationError,
  RequestHeaderName,
  getSubscriptionData,
  changeSchemaSearchPath,
  UserRating,
  getRedisConfig,
  RedisEmptyRecord,
  isRedisEmptyRecord,
  SuguresPostbackPrefix,
  SuguresPostbackResultRow,
  sendSuguresPostback,
} from "../../../../../utils";

export const updateUserRatingHandler = async (req: Request, res: Response) => {
  let subscriptionId, subdomain;
  let pluginVersion;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A03299;

  try {
    subscriptionId = req.header(RequestHeaderName.aa4kSubscriptionId) as string;
    subdomain = req.header(RequestHeaderName.aa4kSubdomain) as string;
    pluginVersion = req.header(RequestHeaderName.aa4kPluginVersion) as string;
    body = (req.body ? JSON.parse(req.body) : {}) as UpdateUserRatingRequestBody;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, pluginVersion, body);

    // 開始ログの出力
    const startLog = {
      message: "会話履歴API(ユーザー評価更新)開始",
      subscriptionId: subscriptionId,
      subdomain: subdomain,
      pluginVersion: pluginVersion,
    };
    console.info(startLog);

    // Secret Manager情報の取得(DB_ACCESS_SECRET)
    const dbAccessSecretName = process.env.DB_ACCESS_SECRET_NAME || "";
    const dbAccessSecretValue = await getSecretValue<DbAccessSecretValue>(dbAccessSecretName);

    // サブスクリプション情報の取得
    const subscriptionData = await getSubscriptionData(subscriptionId, subdomain, dbAccessSecretValue);
    if (!subscriptionData) {
      retErrorStatus = 404;
      retErrorMessage = "SubscriptionData is Not Found";
      retErrorCode = ErrorCode.A03202;
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

    if (body.userRatingComment) {
      // 会話履歴TBLへのユーザー評価コメントの更新
      await updateUserRatingComment(dbClient, body);
    } else if (body.userRating) {
      // 会話履歴TBLへのユーザー評価の更新
      await updateUserRating(dbClient, body);
      // スグレスへポストバック送信
      await sendSuguresPostbacks(body.userRating, subscriptionId, body.conversationId)
    }

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
      retErrorCode = ErrorCode.A03201;
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
const validateRequestParam = (subscriptionId: string, pluginVersion: string, body: UpdateUserRatingRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ヘッダー.プラグインバージョン
    const pluginVersionSchema = z.string();
    pluginVersionSchema.parse(pluginVersion);
    // ボディ
    UpdateUserRatingRequestBodySchema.parse(body);
  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}


/**
 * スグレス ポストバック送信
 * @param subscriptionId 
 * @param conversationId 
 */
async function sendSuguresPostbacks(userRating: UserRating, subscriptionId: string, conversationId: string) {
  let redisClient: Redis | undefined;
  try {
    const suguresEndpoint = process.env.SUGURES_ENDPOINT;
    const suguresClientId = process.env.SUGURES_CLIENT_ID;
    const suguresPostbackUrl = `${suguresEndpoint}/${suguresClientId}/postback`;
    // redis接続情報
    const redisConfig = getRedisConfig();
    // redis接続
    redisClient = new Redis(redisConfig);

    // Redisキー
    const redisKey = `${SuguresPostbackPrefix}_${subscriptionId}_${conversationId}`;
    // ポストバックキー情報の取得
    const postbackKeyData = await redisClient.hgetall(redisKey) as (SuguresPostbackResultRow | RedisEmptyRecord);
    if (!isRedisEmptyRecord(postbackKeyData)) {
      const sessionId = postbackKeyData.sessionId;
      const wasHelpfulPostbackKeys = JSON.parse(postbackKeyData.wasHelpfulPostbackKeys) as string[];
      const wasNotHelpfulPostbackKeys = JSON.parse(postbackKeyData.wasNotHelpfulPostbackKeys) as string[];

      if (userRating === UserRating.good) {
        await Promise.all(
          wasHelpfulPostbackKeys.map((key) =>
            sendSuguresPostback(suguresPostbackUrl, key, subscriptionId, sessionId)
          )
        )
      } else if (userRating === UserRating.bad) {
        await Promise.all(
          wasNotHelpfulPostbackKeys.map((key) =>
            sendSuguresPostback(suguresPostbackUrl, key, subscriptionId, sessionId)
          )
        )
      }

    }

  } finally {
    if (redisClient) {
      // Redis接続を閉じる
      redisClient.quit();
    }
  }
}
