import { Client, QueryResult } from "pg";
import { GetCodeRequestBody } from "./type";

// 型定義
// 最新JSコード取得クエリ結果行
export interface LatestJavascriptCodeResultRow {
  javascript_code: string,
}

/**
 * 会話履歴TBL検索（最新JSコード）
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const selectLatestJavascriptCode = async (dbClient: Client, reqBody: GetCodeRequestBody): Promise<QueryResult<LatestJavascriptCodeResultRow>> => {
  const pram = [
    reqBody.appId,
    reqBody.userId,
    reqBody.deviceDiv,
  ];
  let sql = "";
  sql += `select`;
  sql += ` javascript_code`;
  sql += ` from`;
  sql += ` conversation_history`;
  sql += ` where`;
  sql += ` app_id = $1`;
  sql += ` and user_id = $2`;
  sql += ` and device_div = $3`;
  sql += ` order by`;
  sql += ` id desc`;
  sql += ` limit 1`;

  return await dbClient.query(sql, pram);
};
