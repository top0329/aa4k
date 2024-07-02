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
  sql += ` subscription.subscription_id`;
  sql += ` , subdomain.company_id`;
  sql += ` , subdomain.schema_name`;
  sql += ` , to_char(subdomain.trial_start_date, 'YYYY-MM-DD') as trial_start_date`;
  sql += ` , to_char(subdomain.trial_end_date, 'YYYY-MM-DD') as trial_end_date`;
  sql += ` , to_char(subdomain.contract_start_date, 'YYYY-MM-DD') as contract_start_date`;
  sql += ` , to_char(subdomain.contract_end_date, 'YYYY-MM-DD') as contract_end_date`;
  sql += ` from`;
  sql += ` m_subscription subscription`;
  sql += ` inner join m_subdomain subdomain`;
  sql += ` on subscription.subdomain = subdomain.subdomain`;
  sql += ` where`;
  sql += ` subscription_id = $1`;
  sql += ` and subscription.start_date <= CURRENT_DATE`;
  sql += ` and (subscription.end_date is null or subscription.end_date > CURRENT_DATE)`;

  return await dbClient.query(sql, pram);
};