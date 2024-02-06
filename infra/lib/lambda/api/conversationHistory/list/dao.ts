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
  ai_message_comment: string,
  error_message: string,
  user_rating: string,
}

/**
 * 会話履歴TBL検索（会話履歴一覧）
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const selectConversationHistory = async (dbClient: Client, reqBody: ListRequestBody): Promise<QueryResult<ConversationHistoryResultRow>> => {
  const pram = [
    reqBody.appId,
    reqBody.userId,
    reqBody.deviceDiv,
  ];
  let sql = "";
  sql += `select`;
  sql += ` id`;
  sql += ` , user_message`;
  sql += ` , ai_message`;
  sql += ` , ai_message_comment`;
  sql += ` , error_message`;
  sql += ` , user_rating`;
  sql += ` from`;
  sql += ` conversation_history`;
  sql += ` where`;
  sql += ` app_id = $1`;
  sql += ` and user_id = $2`;
  sql += ` and device_div = $3`;
  sql += ` order by`;
  sql += ` id asc`;

  return dbClient.query(sql, pram);
};
