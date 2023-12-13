import { Client } from "pg";
import { InsertLangchainProcessLogProps } from "./type";

/**
 * Langchain実行ログTBL登録
 * @param dbClient 
 * @param props 
 * @returns クリ実行結果
 */
export const insertLangchainProcessLog = async (dbClient: Client, props: InsertLangchainProcessLogProps) => {
  const pram = [
    props.subscriptionId,    // subscription_id
    props.body.history_id ? props.body.history_id : null,    // history_id
    props.body.session_id ? props.body.session_id : null,    // session_id
    props.body.handle_name ? props.body.handle_name : null,   // handle_name
    props.body.run_name ? props.body.run_name : null,    // run_name
    props.body.run_id ? props.body.run_id : null,    // run_id
    props.body.parent_run_id ? props.body.parent_run_id : null,   // parent_run_id
    props.body.content ? props.body.content : null,   // content
    props.body.metadata_lang_chain_params ? props.body.metadata_lang_chain_params : null,    // metadata_lang_chain_params
    props.body.metadata_extra_params ? props.body.metadata_extra_params : null,   // metadata_extra_params
    props.body.tokens ? props.body.tokens : null,    // tokens
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
