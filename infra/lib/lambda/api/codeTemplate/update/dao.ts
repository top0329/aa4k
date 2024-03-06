import { Client } from "pg";

/**
 * テンプレートコードTBL更新
 * @param dbClient 
 * @param id
 * @param code
 * @returns クエリ実行結果
 */
export const updateTemplateCode = async (dbClient: Client, id: string, code: string) => {
  const pram = [
    code,
    id,
  ]
  let sql = "";
  sql += `update`;
  sql += ` m_template_code`;
  sql += ` set`;
  sql += ` template_code = $1`;
  sql += ` , update_at = now()`;
  sql += ` where`;
  sql += ` template_code_id = $2`;

  return await dbClient.query(sql, pram);
};
