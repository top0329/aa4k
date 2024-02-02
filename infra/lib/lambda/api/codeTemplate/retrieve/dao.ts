import { Client } from "pg";

/**
 * テンプレートコードTBL検索
 * @param dbClient 
 * @param id
 * @returns クエリ実行結果
 */
export const selectTemplateCode = async (dbClient: Client, id: string) => {
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
