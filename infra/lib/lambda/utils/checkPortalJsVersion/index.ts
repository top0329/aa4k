import Redis from 'ioredis';
import { Client } from "pg";
import { selectPortalJsVersion } from "./dao";
import { PortalJsVersionInfo } from "./type";
import { getDbConfig, getRedisConfig } from "..";
import { DbAccessSecretValue } from "../types"

/**
 * ポータルJSバージョンチェック
 * @param portalJsVersion 
 * @param dbAccessSecretValue 
 * @returns チェック結果
 */
export const checkPortalJsVersion = async (portalJsVersion: string, dbAccessSecretValue: DbAccessSecretValue): Promise<boolean> => {
  let dbClient: Client | undefined;
  let redisClient: Redis | undefined;

  try {
    // redis接続情報
    const redisConfig = getRedisConfig();
    // redis接続
    redisClient = new Redis(redisConfig);

    // Redisキー
    const redisKey = 'portalJsVersionList';
    // ポータルJSバージョン管理情報の取得（from Redis）
    let portalJsVersionListStr = await redisClient.get(redisKey);

    if (!portalJsVersionListStr) {
      // 取得できなかった場合、DBよりポータルJSバージョン管理情報を取得
      // データベース接続情報
      const dbConfig = getDbConfig(dbAccessSecretValue)
      // データベース接続
      dbClient = new Client(dbConfig);
      await dbClient.connect();

      // ポータルJSバージョン管理情報の取得
      const latestPortalJsVersions = await selectPortalJsVersion(dbClient);
      portalJsVersionListStr = JSON.stringify(latestPortalJsVersions.rows);

      // DBから取得したポータルJSバージョン管理情報をRedisに登録
      await redisClient.set(redisKey, portalJsVersionListStr);
    }

    // 取得したポータルJSバージョン管理情報（JSON文字列）をオブジェクトに変換
    const portalJsVersionListObj = JSON.parse(portalJsVersionListStr) as PortalJsVersionInfo[];
    // ポータルJSバージョンのチェック
    const isCheckOk = portalJsVersionListObj.some((portalJsVersionObj) => {
      return portalJsVersionObj.version === portalJsVersion;
    });

    return isCheckOk;
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