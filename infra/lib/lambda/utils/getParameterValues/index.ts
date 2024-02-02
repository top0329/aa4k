import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

// Parameter Store情報(AA4K_CONST_PARAMETER_NAME)
export interface AA4KConstParameterValue {
  allowedCidrs: string[],
  retrieveMaxCount: number,
  retrieveScoreThreshold: number,
  historyUseCount: number,
}

/**
 * Parameter Store情報の取得
 * @param parameterName 
 * @returns Parameter Store情報
 */
const getParameterValue = async <T>(parameterName: string): Promise<T> => {
  // Secret Managerから情報取得
  const ssmClient = new SSMClient();
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