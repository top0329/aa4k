import { Client } from "pg";

/**
 * テンプレートコードTBL削除
 * @param dbClient 
 * @param id
 * @returns クエリ実行結果
 */
export const deleteTemplateCode = async (dbClient: Client, id: string) => {
  const pram = [
    id,
  ]
  let sql = "";
  sql += `delete`;
  sql += ` from`;
  sql += ` m_template_code`;
  sql += ` where`;
  sql += ` template_code_id = $1`;

  return await dbClient.query(sql, pram);
};
