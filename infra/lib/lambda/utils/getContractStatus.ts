import { ContractStatus } from "./type";
import { utcToZonedTime } from 'date-fns-tz';

/**
 * 契約ステータスの判断
 * @param trialStartDate 
 * @param trialEndDate 
 * @param contractStartDate 
 * @param contractEndDate 
 * @returns 契約ステータス
 */
export const getContractStatus = (
  trialStartDate: string | null,
  trialEndDate: string | null,
  contractStartDate: string | null,
  contractEndDate: string | null
): string => {
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