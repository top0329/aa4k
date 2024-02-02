import { Client } from "pg";

/**
 * スキーマ検索パスを変更
 * @param dbClient 
 * @param schema
 */
export const changeSchemaSearchPath = async (dbClient: Client, schema: string) => {

  let sql = "";
  sql += `set search_path to ${schema}, public`;

  return await dbClient.query(sql);
}