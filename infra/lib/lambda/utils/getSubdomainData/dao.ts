import { Client, QueryResult } from "pg";
import { SubdomainResultRow } from "./type"

/**
 * サブドメインTBL検索
 * @param dbClient 
 * @param id
 * @returns クエリ実行結果
 */
export const selectSubdomain = async (dbClient: Client, subdomain: string): Promise<QueryResult<SubdomainResultRow>> => {
  const pram = [
    subdomain,
  ]
  let sql = "";
  sql += `select`;
  sql += ` subdomain`;
  sql += ` , company_id`;
  sql += ` , schema_name`;
  sql += ` , to_char(trial_start_date, 'YYYY-MM-DD') as trial_start_date`;
  sql += ` , to_char(trial_end_date, 'YYYY-MM-DD') as trial_end_date`;
  sql += ` , to_char(contract_start_date, 'YYYY-MM-DD') as contract_start_date`;
  sql += ` , to_char(contract_end_date, 'YYYY-MM-DD') as contract_end_date`;
  sql += ` from`;
  sql += ` m_subdomain`;
  sql += ` where`;
  sql += ` subdomain = $1`;

  return await dbClient.query(sql, pram);
};