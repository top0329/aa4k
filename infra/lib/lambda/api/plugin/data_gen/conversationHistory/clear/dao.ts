import { Client, QueryResult, QueryResultRow } from "pg";
import { ClearRequestBody } from "./schema";

/**
 * 会話履歴TBL更新(会話履歴クリア)
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const clearConversationHistory = async (dbClient: Client, reqBody: ClearRequestBody): Promise<QueryResult<QueryResultRow>> => {
  const pram = [
    reqBody.appId,
    reqBody.userId,
  ];

  let sql = "";
  sql += `update`;
  sql += ` t_conversation_history_data_gen`;
  sql += ` set`;
  sql += ` clear_at = now()`;
  sql += ` where`;
  sql += ` app_id = $1`;
  sql += ` and user_id = $2`;
  sql += ` and clear_at is null`;

  return dbClient.query(sql, pram);
};
