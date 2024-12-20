import { Client, QueryResult } from "pg";
import {
  ListRequestBody,
} from "./schema";

// 型定義
// 会話履歴取得クエリ結果行
interface ConversationHistoryResultRow {
  id: string,
  user_message: string,
  ai_message: string,
  error_message: string,
  user_rating: string,
}

/**
 * 会話履歴TBL検索（会話履歴一覧）
 * @param dbClient 
 * @param reqBody
 * @param limit
 * @returns クエリ実行結果
 */
export const selectConversationHistory = async (dbClient: Client, reqBody: ListRequestBody, limit: number): Promise<QueryResult<ConversationHistoryResultRow>> => {
  const pram = [
    reqBody.appId,
    reqBody.userId,
    limit,
  ];
  let sql = "";
  sql += ` select`;
  sql += ` id`;
  sql += ` , user_message`;
  sql += ` , ai_message`;
  sql += ` , error_message`;
  sql += ` from (`;
  sql += ` select`;
  sql += ` id`;
  sql += ` , user_message`;
  sql += ` , ai_message`;
  sql += ` , error_message`;
  sql += ` from`;
  sql += ` t_conversation_history_data_gen`;
  sql += ` where`;
  sql += ` app_id = $1`;
  sql += ` and user_id = $2`;
  sql += ` and clear_at is null`;
  sql += ` order by`;
  sql += ` id desc`;
  sql += ` limit $3`;
  sql += ` ) as sub`;
  sql += ` order by id asc;`;

  return dbClient.query(sql, pram);
};
