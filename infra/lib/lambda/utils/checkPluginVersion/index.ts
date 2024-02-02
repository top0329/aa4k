import Redis from 'ioredis';
import { Client } from "pg";
import { selectPluginVersion } from "./dao";
import { PluginVersionInfo } from "./type";
import { getDbConfig, getRedisConfig } from "..";
import { DbAccessSecretValue } from "../getSecretValues"

/**
 * プラグインバージョンチェック
 * @param pluginVersion 
 * @param dbAccessSecretValue 
 * @returns チェック結果
 */
export const checkPluginVersion = async (pluginVersion: string, dbAccessSecretValue: DbAccessSecretValue): Promise<boolean> => {
  let dbClient: Client | undefined;
  let redisClient: Redis | undefined;

  try {
    // redis接続情報
    const redisConfig = getRedisConfig();
    // redis接続
    redisClient = new Redis(redisConfig);

    // Redisキー
    const redisKey = 'pluginVersionList';
    // プラグインバージョン管理情報の取得（from Redis）
    let pluginVersionListStr = await redisClient.get(redisKey);

    if (!pluginVersionListStr) {
      // 取得できなかった場合、DBよりプラグインバージョン管理情報を取得
      // データベース接続情報
      const dbConfig = getDbConfig(dbAccessSecretValue)
      // データベース接続
      dbClient = new Client(dbConfig);
      await dbClient.connect();

      // プラグインバージョン管理情報の取得
      const latestPluginVersions = await selectPluginVersion(dbClient);
      pluginVersionListStr = JSON.stringify(latestPluginVersions.rows);

      // DBから取得したプラグインバージョン管理情報をRedisに登録
      await redisClient.set(redisKey, pluginVersionListStr);
    }

    // 取得したプラグインバージョン管理情報（JSON文字列）をオブジェクトに変換
    const pluginVersionListObj = JSON.parse(pluginVersionListStr) as PluginVersionInfo[];
    // プラグインバージョンのチェック
    const isCheckOk = pluginVersionListObj.some((pluginVersionObj) => {
      return pluginVersionObj.version === pluginVersion;
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