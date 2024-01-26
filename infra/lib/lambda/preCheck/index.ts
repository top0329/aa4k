import Redis from 'ioredis';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { utcToZonedTime } from 'date-fns-tz';
import { z } from "zod";
import { getParameterValues, getSecretValues } from "../utils";
import { RequestHeaderName, ContractStatus } from '../utils/type'
import { checkPluginVersion } from "../utils/versionCheck";
import { getSubscriptionData } from "../utils/getSubscriptionData"

/**
 * 事前チェックAPI
 * @param event 
 * @param context 
 * @returns 
 */
exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subscriptionId;
  let pluginVersion;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  try {
    subscriptionId = event.headers[RequestHeaderName.aa4kSubscriptionId] as string;
    pluginVersion = event.headers[RequestHeaderName.aa4kPluginVersion] as string;
    // リクエストのバリデーション
    await validateRequestParam(subscriptionId, pluginVersion).catch(async (err) => {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      throw err;
    });

    // 開始ログの出力
    const startLog = {
      message: "事前チェックAPI開始",
      subscriptionId: subscriptionId,
      pluginVersion: pluginVersion,
    };
    console.info(startLog);

    // Parameter Store情報の取得(aa4kConst)
    const { aa4kConstParameterValue } = await getParameterValues();
    // Secret Manager情報の取得(DB_ACCESS_SECRET)
    const { dbAccessSecretValue } = await getSecretValues();

    // プラグインバージョンチェック
    const isVersionOk = await checkPluginVersion(pluginVersion, dbAccessSecretValue);
    if (!isVersionOk) {
      response = {
        statusCode: 422,
        body: JSON.stringify({ message: "Unsupported Version", }),
      };
      return response;
    }

    // サブスクリプション情報の取得
    const subscriptionData = await getSubscriptionData(subscriptionId, dbAccessSecretValue)
    if (subscriptionData) {
      const contractStatus = getContractStatus(subscriptionData.trial_start_date, subscriptionData.trial_end_date, subscriptionData.contract_start_date, subscriptionData.contract_end_date)
      response = {
        statusCode: 200,
        body: JSON.stringify({ contractStatus: contractStatus, systemSettings: { retrieveMaxCount: aa4kConstParameterValue.retrieveMaxCount, retrieveScoreThreshold: aa4kConstParameterValue.retrieveScoreThreshold } }),
      };
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify({ contractStatus: "", systemSettings: { retrieveMaxCount: aa4kConstParameterValue.retrieveMaxCount, retrieveScoreThreshold: aa4kConstParameterValue.retrieveScoreThreshold } }),
      };
    }

  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subscriptionId: subscriptionId,
      error: err,
    });
    console.error(errorMessage);
    response = {
      statusCode: retErrorStatus,
      body: JSON.stringify({ message: retErrorMessage })
    };
  }
  return response;
};


/**
 * リクエストパラメータのバリデーション
 * @param subscriptionId 
 * @param pluginVersion 
 */
const validateRequestParam = async (subscriptionId: string, pluginVersion: string) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ヘッダー.プラグインバージョン
    const pluginVersionSchema = z.string();
    pluginVersionSchema.parse(pluginVersion);
  } catch (err) {
    throw err;
  }
}

/**
 * 契約ステータスの判断
 * @param trialStartDate 
 * @param trialEndDate 
 * @param contractStartDate 
 * @param contractEndDate 
 * @returns 
 */
function getContractStatus(
  trialStartDate: string | null,
  trialEndDate: string | null,
  contractStartDate: string | null,
  contractEndDate: string | null
): string {
  const timeZone = 'Asia/Tokyo';
  const nowUtc = new Date();// UTCの現在時刻を取得
  const nowJST = utcToZonedTime(nowUtc, timeZone);// UTCから日本時間に変換

  function isInfiniteOrWithinRange(startDate: string | null, endDate: string | null): boolean {
    if (startDate === null) return false;
    const start = new Date(startDate);
    if (endDate === null) return nowJST >= start;
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    return nowJST >= start && nowJST <= end;
  }

  if (isInfiniteOrWithinRange(trialStartDate, trialEndDate)) {
    return ContractStatus.trial;
  } else if (isInfiniteOrWithinRange(contractStartDate, contractEndDate)) {
    return ContractStatus.active;
  } else {
    return ContractStatus.expired;
  }
}