import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from "zod";
import { ErrorCode } from "./constants";
import { getParameterValues, getSecretValues, ValidationError, getContractStatus, checkPortalJsVersion, getSubdomainData, RequestHeaderName } from "../../../../utils";

/**
 * 事前チェック_アプリ生成用API
 * @param event 
 * @param context 
 * @returns 
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subdomain;
  let portalJsVersion;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A12099;
  try {
    subdomain = event.headers[RequestHeaderName.aa4kSubdomain] as string;
    portalJsVersion = event.headers[RequestHeaderName.aa4kPortalJsVersion] as string;

    // リクエストのバリデーション
    validateRequestParam(subdomain, portalJsVersion)

    // 開始ログの出力
    const startLog = {
      message: "事前チェック_アプリ生成用API開始",
      subdomain: subdomain,
      portalJsVersion: portalJsVersion,
    };
    console.info(startLog);

    // 並列でSecret Manager情報とParameter Store情報を取得させる
    const [secret, parameter] = await Promise.all([
      getSecretValues(),
      getParameterValues(),
    ]);
    const dbAccessSecretValue = secret.dbAccessSecretValue;
    const aa4kConstParameterValue = parameter.aa4kConstParameterValue;

    // ポータルJSバージョンチェック
    const isVersionOk = await checkPortalJsVersion(portalJsVersion, dbAccessSecretValue);
    if (!isVersionOk) {
      response = {
        statusCode: 422,
        body: JSON.stringify({ message: "Unsupported Version", errorCode: ErrorCode.A12002 }),
      };
      return response;
    }

    // サブドメイン情報の取得
    const subdomainData = await getSubdomainData(subdomain, dbAccessSecretValue)
    if (!subdomainData) {
      response = {
        statusCode: 404,
        body: JSON.stringify({ message: "SubdomainData is Not Found", errorCode: ErrorCode.A12003 }),
      };
      return response;
    }

    // 契約ステータスの取得
    const contractStatus = getContractStatus(subdomainData)
    response = {
      statusCode: 200,
      body: JSON.stringify({
        contractStatus: contractStatus,
        systemSettings: {
          historyUseCount: aa4kConstParameterValue.historyUseCount,
        }
      }),
    };

  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subdomain: subdomain,
      error: err,
    });
    console.error(errorMessage);
    if (err instanceof ValidationError) {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      retErrorCode = ErrorCode.A12001;
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
 * @param subdomain 
 * @param portalJsVersion 
 */
const validateRequestParam = (subdomain: string, portalJsVersion: string) => {
  try {
    // ヘッダー.サブドメイン
    const subdomainSchema = z.string();
    subdomainSchema.parse(subdomain);
    // ヘッダー.ポータルJSバージョン
    const portalJsVersionSchema = z.string();
    portalJsVersionSchema.parse(portalJsVersion);
  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}