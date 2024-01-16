import { DbAccessSecretValue } from "./type"

/**
 * DB接続情報
 * @param dbAccessSecretValue 
 * @returns DB接続情報
 */
export const getDbConfig = (dbAccessSecretValue: DbAccessSecretValue) => {
  return {
    type: dbAccessSecretValue.engine,
    host: process.env.RDS_PROXY_ENDPOINT,
    database: dbAccessSecretValue.dbname,
    user: dbAccessSecretValue.username,
    password: dbAccessSecretValue.password,
    port: dbAccessSecretValue.port,
    ssl: true,
  };
}

/**
 * Redis接続情報
 * @returns Redis接続情報
 */
export const getRedisConfig = () => {
  return {
    host: process.env.REDIS_ENDPOINT,
    port: parseInt(process.env.REDIS_ENDPOINT_PORT || '6379', 10),
  };
}
