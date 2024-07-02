import { ContractStatus } from "../constants";
import { utcToZonedTime } from 'date-fns-tz';
import { SubscriptionResultRow } from "../getSubscriptionData/type";
import { SubdomainResultRow } from "../getSubdomainData/type";

/**
 * 契約ステータスの判断
 *     trial_start_date が未設定(null or ブランク)の場合は expired(契約期間外)
 *     trial_end_date,contract_end_date が未設定(null or ブランク)の場合は無期限扱い
 * @param inputData 
 * @returns 契約ステータス
 */
export const getContractStatus = (inputData: SubscriptionResultRow | SubdomainResultRow): ContractStatus => {
  const { trial_start_date: trialStartDate, trial_end_date: trialEndDate, contract_start_date: contractStartDate, contract_end_date: contractEndDate } = inputData;
  const timeZone = 'Asia/Tokyo';
  const nowUtc = new Date();// UTCの現在時刻を取得
  const nowJST = utcToZonedTime(nowUtc, timeZone);// UTCから日本時間に変換

  function isInfiniteOrWithinRange(startDate: string | null, endDate: string | null): boolean {
    if (startDate == null || startDate == '') return false;
    const start = new Date(startDate);
    if (endDate == null || endDate == '') return nowJST >= start;
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