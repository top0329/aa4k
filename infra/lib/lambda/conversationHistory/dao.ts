import { Client, QueryResult, QueryResultRow } from "pg";
import {
  ListRequestBody,
  InsertRequestBody,
} from "./type";

// 型定義
// 会話履歴取得クエリ結果行
interface ConversationHistoryResultRow {
  id: string,
  user_message: string,
  ai_message: string,
  ai_message_additional: string,
  system_message: string,
  user_rating: string,
}

// 会話履歴登録クエリ結果行
interface InsertQueryResultRow {
  id: string,
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
  sql += ` , ai_message_additional`;
  sql += ` , system_message`;
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

/**
 * 会話履歴TBL登録
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const insertConversationHistory = async (dbClient: Client, reqBody: InsertRequestBody): Promise<QueryResult<InsertQueryResultRow>> => {
  const pram = [
    reqBody.appId,
    reqBody.userId,
    reqBody.deviceDiv,
    reqBody.message,
  ];
  let sql = "";
  sql += `insert into`;
  sql += ` conversation_history`;
  sql += ` (`;
  sql += ` app_id`;
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
  sql += ` , now()`;
  sql += ` )`;
  sql += ` returning id`;

  return dbClient.query(sql, pram);
};

/**
 * 会話履歴TBL更新(AI発言)
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const updateAiConversationHistory = async (dbClient: Client, reqBody: InsertRequestBody): Promise<QueryResult<QueryResultRow>> => {
    const pram = [
      reqBody.message,
      reqBody.messageAdditional,
      reqBody.javascriptCode,
      reqBody.conversationId,
    ];

    let sql = "";
    sql += `update`;
    sql += ` conversation_history`;
    sql += ` set`;
    sql += ` ai_message = $1`;
    sql += ` , ai_message_additional = $2`;
    sql += ` , javascript_code = $3`;
    sql += ` , ai_message_at = now()`;
    sql += ` where`;
    sql += ` id = $4`;

    return dbClient.query(sql, pram);
};

/**
 * 会話履歴TBL更新(システム発言)
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const updateSystemConversationHistory = async (dbClient: Client, reqBody: InsertRequestBody): Promise<QueryResult<QueryResultRow>> => {
  const pram = [
    reqBody.message,
    reqBody.conversationId,
  ];

  let sql = "";
  sql += `update`;
  sql += ` conversation_history`;
  sql += ` set`;
  sql += ` system_message = $1`;
  sql += ` , system_message_at = now()`;
  sql += ` where`;
  sql += ` id = $2`;

  return dbClient.query(sql, pram);
};