import { Client, QueryResult, QueryResultRow } from "pg";
import {
  InsertRequestBody,
} from "./schema";

// 型定義

// 会話履歴登録クエリ結果行
interface InsertQueryResultRow {
  id: string,
}

/**
 * 会話履歴TBL登録
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const insertConversationHistory = async (dbClient: Client, subdomain: string, reqBody: InsertRequestBody): Promise<QueryResult<InsertQueryResultRow>> => {
  const pram = [
    subdomain,
    reqBody.userId,
    reqBody.sessionId,
    reqBody.actionType,
    reqBody.userMessage,
  ];
  let sql = "";
  sql += `insert into`;
  sql += ` t_conversation_history_app_gen`;
  sql += ` (`;
  sql += ` sub_domain`;
  sql += ` , user_id`;
  sql += ` , session_id`;
  sql += ` , action_type`;
  sql += ` , user_message`;
  sql += ` , user_message_at`;
  sql += ` )`;
  sql += ` values`;
  sql += ` (`;
  sql += ` $1`;
  sql += ` , $2`;
  sql += ` , $3`;
  sql += ` , $4`;
  sql += ` , $5`;
  sql += ` , now()`;
  sql += ` )`;
  sql += ` returning id`;

  return dbClient.query(sql, pram);
};

/**
 * 会話履歴TBL更新
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const updateAiConversationHistory = async (dbClient: Client, reqBody: InsertRequestBody): Promise<QueryResult<QueryResultRow>> => {
  const pram = [
    reqBody.actionType,
    reqBody.resultMessage,
    reqBody.resultMessageDetail,
    reqBody.aiResponse,
    reqBody.appId,
    reqBody.conversationId,
  ];

  let sql = "";
  sql += `update`;
  sql += ` t_conversation_history_app_gen`;
  sql += ` set`;
  sql += ` action_type = $1`;
  sql += ` , result_message = $2`;
  sql += ` , result_message_detail = $3`;
  sql += ` , ai_response = $4`;
  sql += ` , result_message_at = now()`;
  sql += ` , app_id = $5`;
  sql += ` where`;
  sql += ` id = $6`;

  return dbClient.query(sql, pram);
};
