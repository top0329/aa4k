import { DbAccessSecretValue } from "../getSecretValues";

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