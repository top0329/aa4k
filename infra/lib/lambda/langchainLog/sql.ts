import { Client } from "pg";
import { InsertLangchainProcessLogProps } from "./type";

/**
 * Langchain実行ログTBL登録
 * @param dbClient 
 * @param pram 
 * @returns 
 */
export const insertLangchainProcessLog = async (dbClient: Client, props: InsertLangchainProcessLogProps) => {
  const pram = [
    props.subscription_id,    // subscription_id
    props.LogLangchainRequestBody.history_id ? props.LogLangchainRequestBody.history_id : null,    // history_id
    props.LogLangchainRequestBody.session_id ? props.LogLangchainRequestBody.session_id : null,    // session_id
    props.LogLangchainRequestBody.handle_name ? props.LogLangchainRequestBody.handle_name : null,   // handle_name
    props.LogLangchainRequestBody.run_name ? props.LogLangchainRequestBody.run_name : null,    // run_name
    props.LogLangchainRequestBody.run_id ? props.LogLangchainRequestBody.run_id : null,    // run_id
    props.LogLangchainRequestBody.parent_run_id ? props.LogLangchainRequestBody.parent_run_id : null,   // parent_run_id
    props.LogLangchainRequestBody.content ? props.LogLangchainRequestBody.content : null,   // content
    props.LogLangchainRequestBody.metadata_lang_chain_params ? props.LogLangchainRequestBody.metadata_lang_chain_params : null,    // metadata_lang_chain_params
    props.LogLangchainRequestBody.metadata_extra_params ? props.LogLangchainRequestBody.metadata_extra_params : null,   // metadata_extra_params
    props.LogLangchainRequestBody.tokens ? props.LogLangchainRequestBody.tokens : null,    // tokens
    props.currentDate,
  ]
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
