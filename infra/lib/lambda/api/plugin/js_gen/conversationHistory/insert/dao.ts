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
export const insertConversationHistory = async (dbClient: Client, reqBody: InsertRequestBody, subscriptionId: string): Promise<QueryResult<InsertQueryResultRow>> => {
  const pram = [
    subscriptionId,
    reqBody.appId,
    reqBody.userId,
    reqBody.deviceDiv,
    reqBody.message,
  ];
  let sql = "";
  sql += `insert into`;
  sql += ` t_conversation_history_js_gen`;
  sql += ` (`;
  sql += ` subscription_id`;
  sql += ` , app_id`;
  sql += ` , user_id`;
  sql += ` , device_div`;
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
 * 会話履歴TBL更新(AI回答)
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const updateAiConversationHistory = async (dbClient: Client, reqBody: InsertRequestBody): Promise<QueryResult<QueryResultRow>> => {
  const pram = [
    reqBody.message,
    reqBody.messageComment,
    reqBody.javascriptCode,
    reqBody.conversationId,
  ];

  let sql = "";
  sql += `update`;
  sql += ` t_conversation_history_js_gen`;
  sql += ` set`;
  sql += ` ai_message = $1`;
  sql += ` , ai_message_comment = $2`;
  sql += ` , javascript_code = $3`;
  sql += ` , ai_message_at = now()`;
  sql += ` where`;
  sql += ` id = $4`;

  return dbClient.query(sql, pram);
};

/**
 * 会話履歴TBL更新(エラーメッセージ)
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const updateErrorConversationHistory = async (dbClient: Client, reqBody: InsertRequestBody): Promise<QueryResult<QueryResultRow>> => {
  const pram = [
    reqBody.message,
    reqBody.conversationId,
  ];

  let sql = "";
  sql += `update`;
  sql += ` t_conversation_history_js_gen`;
  sql += ` set`;
  sql += ` error_message = $1`;
  sql += ` , error_message_at = now()`;
  sql += ` where`;
  sql += ` id = $2`;

  return dbClient.query(sql, pram);
};