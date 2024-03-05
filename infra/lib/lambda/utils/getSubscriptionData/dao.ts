import { Client, QueryResult } from "pg";
import { SubscriptionResultRow } from "./type"

/**
 * サブスクリプションTBL検索
 * @param dbClient 
 * @param id
 * @returns クエリ実行結果
 */
export const selectSubscription = async (dbClient: Client, subscriptionId: string): Promise<QueryResult<SubscriptionResultRow>> => {
  const pram = [
    subscriptionId,
  ]
  let sql = "";
  sql += `select`;
  sql += ` subscription_id`;
  sql += ` , company_id`;
  sql += ` , schema_name`;
  sql += ` , to_char(trial_start_date, 'YYYY-MM-DD') as trial_start_date`;
  sql += ` , to_char(trial_end_date, 'YYYY-MM-DD') as trial_end_date`;
  sql += ` , to_char(contract_start_date, 'YYYY-MM-DD') as contract_start_date`;
  sql += ` , to_char(contract_end_date, 'YYYY-MM-DD') as contract_end_date`;
  sql += ` from`;
  sql += ` m_subscription`;
  sql += ` where`;
  sql += ` subscription_id = $1`;

  return await dbClient.query(sql, pram);
};