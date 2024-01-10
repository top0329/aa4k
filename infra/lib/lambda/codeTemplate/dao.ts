import { Client } from "pg";

/**
 * テンプレートコードTBL登録
 * @param dbClient 
 * @param id 
 * @param code 
 * @returns クエリ実行結果
 */
export const insertTmplateCode = async (dbClient: Client, id: string, code: string) => {
  const pram = [
    id,
    code,
  ]
  let sql = "";
  sql += `insert into`;
  sql += ` template_code`;
  sql += ` (`;
  sql += ` template_code_id`;
  sql += ` , template_code`;
  sql += ` , create_at`;
  sql += ` , update_at`;
  sql += ` )`;
  sql += ` values`;
  sql += ` (`;
  sql += ` $1`;
  sql += ` , $2`;
  sql += ` , now()`;
  sql += ` , now()`;
  sql += ` )`;

  return await dbClient.query(sql, pram);
};

/**
 * テンプレートコードTBL検索
 * @param dbClient 
 * @param id
 * @returns クエリ実行結果
 */
export const selectTmplateCode = async (dbClient: Client, id: string) => {
  const pram = [
    id,
  ]
  let sql = "";
  sql += `select template_code`;
  sql += ` from`;
  sql += ` template_code`;
  sql += ` where`;
  sql += ` template_code_id = $1`;

  return await dbClient.query(sql, pram);
};

/**
 * テンプレートコードTBL更新
 * @param dbClient 
 * @param id
 * @param code
 * @returns クエリ実行結果
 */
export const updateTmplateCode = async (dbClient: Client, id: string, code: string) => {
  const pram = [
    code,
    id,
  ]
  let sql = "";
  sql += `update`;
  sql += ` template_code`;
  sql += ` set`;
  sql += ` template_code = $1`;
  sql += ` , update_at = now()`;
  sql += ` where`;
  sql += ` template_code_id = $2`;

  return await dbClient.query(sql, pram);
};
/**
 * テンプレートコードTBL削除
 * @param dbClient 
 * @param id
 * @returns クエリ実行結果
 */
export const deleteTmplateCode = async (dbClient: Client, id: string) => {
  const pram = [
    id,
  ]
  let sql = "";
  sql += `delete`;
  sql += ` from`;
  sql += ` template_code`;
  sql += ` where`;
  sql += ` template_code_id = $1`;

  return await dbClient.query(sql, pram);
};
