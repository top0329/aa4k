import Redis from 'ioredis';
import { Client } from "pg";
import { selectSubdomain } from "./dao";
import { SubdomainResultRow } from "./type";
import { getDbConfig, getRedisConfig, isRedisEmptyRecord, RedisEmptyRecord, DbAccessSecretValue } from "../../utils";
import { addDays, differenceInSeconds } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

/**
 * サブドメイン情報の取得
 * @param subdomain
 * @param dbAccessSecretValue 
 * @returns チェック結果
 */
export const getSubdomainData = async (subdomain: string, dbAccessSecretValue: DbAccessSecretValue): Promise<SubdomainResultRow | null> => {
  let dbClient: Client | undefined;
  let redisClient: Redis | undefined;

  try {
    // redis接続情報
    const redisConfig = getRedisConfig();
    // redis接続
    redisClient = new Redis(redisConfig);

    // Redisキー
    const redisKey = `subdomainData_${subdomain}`;
    // サブドメイン情報の取得（from Redis）
    const subdomainData = await redisClient.hgetall(redisKey) as (SubdomainResultRow | RedisEmptyRecord);

    if (isRedisEmptyRecord(subdomainData)) {
      // 取得できなかった場合、DBよりサブドメイン情報を取得
      // データベース接続情報
      const dbConfig = getDbConfig(dbAccessSecretValue)
      // データベース接続
      dbClient = new Client(dbConfig);
      await dbClient.connect();

      // サブドメイン情報の取得
      const latestSubdomainData = await selectSubdomain(dbClient, subdomain);
      if (latestSubdomainData.rowCount === null || latestSubdomainData.rowCount === 0) {
        return null;
      } else if (latestSubdomainData.rowCount >= 2) {
        // 重複したサブドメイン情報が存在する場合
        throw new Error("Duplicated subdomain data exists in database");
      }

      // DBから取得したサブドメイン情報をRedisに登録
      await redisClient.hmset(redisKey, latestSubdomainData.rows[0]);
      // Redisに登録したサブドメイン情報に有効期限(当日まで)を設定
      await redisClient.expire(redisKey, getExpirationTime());
      return latestSubdomainData.rows[0];
    } else {
      return subdomainData;
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
