import { Client, QueryResult, QueryResultRow } from "pg";
import { UpdateUserRatingRequestBody } from "./schema";

/**
 * 会話履歴TBL更新(ユーザー評価)
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const updateUserRating = async (dbClient: Client, reqBody: UpdateUserRatingRequestBody): Promise<QueryResult<QueryResultRow>> => {
  const pram = [
    reqBody.userRating,
    reqBody.conversationId,
  ];

  let sql = "";
  sql += `update`;
  sql += ` conversation_history`;
  sql += ` set`;
  sql += ` user_rating = $1`;
  sql += ` where`;
  sql += ` id = $2`;

  return dbClient.query(sql, pram);
};

/**
 * 会話履歴TBL更新(ユーザー評価コメント)
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const updateUserRatingComment = async (dbClient: Client, reqBody: UpdateUserRatingRequestBody): Promise<QueryResult<QueryResultRow>> => {
  const pram = [
    reqBody.userRatingComment,
    reqBody.conversationId,
  ];

  let sql = "";
  sql += `update`;
  sql += ` conversation_history`;
  sql += ` set`;
  sql += ` user_rating_comment = $1`;
  sql += ` where`;
  sql += ` id = $2`;

  return dbClient.query(sql, pram);
};
