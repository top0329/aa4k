import { Client } from "pg";

/**
 * テンプレートコードTBL登録
 * @param dbClient 
 * @param id 
 * @param code 
 * @returns クエリ実行結果
 */
export const insertTemplateCode = async (dbClient: Client, id: string, code: string) => {
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
