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
  sql += ` m_template_code`;
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
 * テンプレートコードTBL削除
 * @param dbClient 
 * @param id 
 * @param code 
 * @returns クエリ実行結果
 */
export const deleteTemplateCode = async (dbClient: Client, collectionName: string) => {
  const pram = [
    collectionName
  ]
  let sql = "";
  sql += `delete`
  sql += ` from`
  sql += ` m_template_code a `
  sql += ` where`
  sql += ` exists ( `
  sql += ` select`
  sql += ` * `
  sql += ` from`
  sql += ` m_langchain_embedding b `
  sql += ` inner join m_langchain_embedding_collection c `
  sql += ` on b.collection_id = c.uuid `
  sql += ` where`
  sql += ` c.name = $1 `
  sql += ` and a.template_code_id = b.metadata ->> 'templateCodeId'`
  sql += ` )`


  return await dbClient.query(sql, pram);
};

/**
 * m_langchain_embedding_collection削除
 * @param dbClient 
 * @param id 
 * @param code 
 * @returns クエリ実行結果
 */
export const deleteLangchainEmbeddingCollection = async (dbClient: Client, collectionName: string) => {
  const pram = [
    collectionName
  ]
  let sql = "";
  sql += `delete`
  sql += ` from`
  sql += ` m_langchain_embedding_collection`
  sql += ` where`
  sql += ` name = $1`
  return await dbClient.query(sql, pram);
};
