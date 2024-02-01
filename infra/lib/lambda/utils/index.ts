import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { DbAccessSecretValue, AzureSecretValue, AA4KConstParameterValue } from "./type";

const secretsManagerClient = new SecretsManagerClient();
const ssmClient = new SSMClient();

/**
 * Secret Manager情報の取得
 * @param secretName 
 * @returns Secret Manager情報
 */
export const getSecretValue = async <T>(secretName: string): Promise<T> => {
  // Secret Managerから情報取得
  const result = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: secretName,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
  // 取得できない場合はエラー
  if (!result.SecretString) throw 'Secret value is empty';

  const SecretValue: T = JSON.parse(result.SecretString);
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
    getSecretValue<DbAccessSecretValue>(dbAccessSecretName),
    getSecretValue<AzureSecretValue>(azureSecretName)
  ])

  const dbAccessSecretValue = db;
  const azureSecretValue = azure;
  return { dbAccessSecretValue, azureSecretValue };
}

/**
 * Parameter Store情報の取得
 * @param parameterName 
 * @returns Parameter Store情報
 */
export const getParameterValue = async <T>(parameterName: string): Promise<T> => {
  // Secret Managerから情報取得
  const result = await ssmClient.send(
    new GetParameterCommand({
      Name: parameterName,
      WithDecryption: false,
    })
  );
  // 取得できない場合はエラー
  if (!result.Parameter || !result.Parameter.Value) throw 'Parameter value is empty';

  const ParameterValue: T = JSON.parse(result.Parameter.Value);
  return ParameterValue;
}

/**
 * Parameter Store情報（システム定数）の取得
 * @returns Secret Manager情報
 */
export const getParameterValues = async () => {
  const aa4kConstParameterName = process.env.AA4K_CONST_PARAMETER_NAME ? process.env.AA4K_CONST_PARAMETER_NAME : "";
  // 並列で取得させる
  const [aa4kConst] = await Promise.all([
    getParameterValue<AA4KConstParameterValue>(aa4kConstParameterName),
  ])

  const aa4kConstParameterValue = aa4kConst;
  return { aa4kConstParameterValue };
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

/**
 * バリデーションエラークラス
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}