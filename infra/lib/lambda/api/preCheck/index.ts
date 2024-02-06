import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from "zod";
import { ErrorCode } from "./constants";
import { getParameterValues, getSecretValues, ValidationError, getContractStatus, checkPluginVersion, getSubscriptionData, RequestHeaderName } from "../../utils";

/**
 * 事前チェックAPI
 * @param event 
 * @param context 
 * @returns 
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subscriptionId;
  let pluginVersion;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A02003;
  try {
    subscriptionId = event.headers[RequestHeaderName.aa4kSubscriptionId] as string;
    pluginVersion = event.headers[RequestHeaderName.aa4kPluginVersion] as string;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, pluginVersion)

    // 開始ログの出力
    const startLog = {
      message: "事前チェックAPI開始",
      subscriptionId: subscriptionId,
      pluginVersion: pluginVersion,
    };
    console.info(startLog);

    // 並列でSecret Manager情報とParameter Store情報を取得させる
    const [secret, parameter] = await Promise.all([
      getSecretValues(),
      getParameterValues(),
    ]);
    const dbAccessSecretValue = secret.dbAccessSecretValue;
    const aa4kConstParameterValue = parameter.aa4kConstParameterValue;

    // プラグインバージョンチェック
    const isVersionOk = await checkPluginVersion(pluginVersion, dbAccessSecretValue);
    if (!isVersionOk) {
      response = {
        statusCode: 422,
        body: JSON.stringify({ message: "Unsupported Version", errorCode: ErrorCode.A02002 }),
      };
      return response;
    }

    // サブスクリプション情報の取得
    const subscriptionData = await getSubscriptionData(subscriptionId, dbAccessSecretValue)
    if (!subscriptionData) {
      response = {
        statusCode: 404,
        body: JSON.stringify({ message: "SubscriptionData is Not Found", }),
      };
      return response;
    }

    // 契約ステータスの取得
    const contractStatus = getContractStatus(subscriptionData)
    response = {
      statusCode: 200,
      body: JSON.stringify({
        contractStatus: contractStatus,
        systemSettings: {
          retrieveMaxCount: aa4kConstParameterValue.retrieveMaxCount,
          retrieveScoreThreshold: aa4kConstParameterValue.retrieveScoreThreshold,
          historyUseCount: aa4kConstParameterValue.historyUseCount,
        }
      }),
    };

  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subscriptionId: subscriptionId,
      error: err,
    });
    console.error(errorMessage);
    if (err instanceof ValidationError) {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      retErrorCode = ErrorCode.A02001;
    }
    response = {
      statusCode: retErrorStatus,
      body: JSON.stringify({ message: retErrorMessage, errorCode: retErrorCode })
    };
  }
  return response;
};


/**
 * リクエストパラメータのバリデーション
 * @param subscriptionId 
 * @param pluginVersion 
 */
const validateRequestParam = (subscriptionId: string, pluginVersion: string) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ヘッダー.プラグインバージョン
    const pluginVersionSchema = z.string();
    pluginVersionSchema.parse(pluginVersion);
  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}