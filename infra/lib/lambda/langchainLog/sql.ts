import { Client } from "pg";

/**
 * Langchain実行ログTBL登録
 * @param dbClient 
 * @param pram 
 * @returns 
 */
export const insertLangchainProcessLog = async (dbClient: Client, pram: (string | null)[]) => {
  let sql = "";
  sql += `insert into`;
  sql += ` LANGCHAIN_PROCESS_LOGS`;
  sql += ` (`;
  sql += ` SUBSCRIPTION_ID`;
  sql += ` , HISTORY_ID`;
  sql += ` , SESSION_ID`;
  sql += ` , HANDLE_NAME`;
  sql += ` , RUN_NAME`;
  sql += ` , RUN_ID`;
  sql += ` , PARENT_RUN_ID`;
  sql += ` , CONTENT`;
  sql += ` , METADATA_LANGCHAIN_PARAMS`;
  sql += ` , METADATA_EXTRA_PARAMS`;
  sql += ` , TOKENS`;
  sql += ` , EXECUTE_DATE`;
  sql += ` , CREATE_DATE`;
  sql += ` ) `;
  sql += ` values `;
  sql += ` (`;
  sql += ` $1`;
  sql += ` , $2`;
  sql += ` , $3`;
  sql += ` , $4`;
  sql += ` , $5`;
  sql += ` , $6`;
  sql += ` , $7`;
  sql += ` , $8`;
  sql += ` , $9`;
  sql += ` , $10`;
  sql += ` , $11`;
  sql += ` , $12`;
  sql += ` , now()`;
  sql += ` )`;

  return await dbClient.query(sql, pram);
};
