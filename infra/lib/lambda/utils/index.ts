import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { DbAccessSecretValue, AzureSecretValue } from "./type";

const secretsManagerClient = new SecretsManagerClient();

/**
 * Secret Manager情報の取得
 * @param secretName 
 * @returns Secret Manager情報
 */
export const getSecretValue = async (secretName: string) => {
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
 * Secret Manager情報（DB, Azure）の取得
 * @returns Secret Manager情報
 */
export const getSecretValues = async () => {
  const dbAccessSecretName = process.env.DB_ACCESS_SECRET_NAME ? process.env.DB_ACCESS_SECRET_NAME : "";
  const azureSecretName = process.env.AZURE_SECRET_NAME ? process.env.AZURE_SECRET_NAME : "";
  // 並列で2個取得させる
  const [db, azure] = await Promise.all([
    getSecretValue(dbAccessSecretName),
    getSecretValue(azureSecretName)
  ])

  const dbAccessSecretValue = db as DbAccessSecretValue;
  const azureSecretValue = azure as AzureSecretValue;
  return { dbAccessSecretValue, azureSecretValue };
}

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
