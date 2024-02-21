import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { AzureSecretValue, DbAccessSecretValue } from "../types";

/**
 * Secret Manager情報の取得
 * @param secretName 
 * @returns Secret Manager情報
 */
export const getSecretValue = async <T>(secretName: string): Promise<T> => {
  // Secret Managerから情報取得
  const secretsManagerClient = new SecretsManagerClient();
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