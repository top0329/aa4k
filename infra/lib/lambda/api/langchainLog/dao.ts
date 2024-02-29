import { Client } from "pg";
import { InsertLangchainProcessLogProps } from "./schema";

/**
 * Langchain実行ログTBL登録
 * @param dbClient 
 * @param props 
 * @returns クエリ実行結果
 */
export const insertLangchainProcessLog = async (dbClient: Client, props: InsertLangchainProcessLogProps) => {
  const pram = [
    props.subscriptionId,    // subscription_id
    props.body.app_id ? props.body.app_id : null,    // app_id
    props.body.user_id ? props.body.user_id : null,    // user_id
    props.body.session_id ? props.body.session_id : null,    // session_id
    props.body.conversation_id ? props.body.conversation_id : null,    // conversation_id
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
  sql += ` subscription_id`;
  sql += ` , app_id`
  sql += ` , user_id`
  sql += ` , session_id`;
  sql += ` , conversation_id`
  sql += ` , handle_name`;
  sql += ` , run_name`;
  sql += ` , run_id`;
  sql += ` , parent_run_id`;
  sql += ` , content`;
  sql += ` , metadata_langchain_params`;
  sql += ` , metadata_extra_params`;
  sql += ` , tokens`;
  sql += ` , execute_date`;
  sql += ` , create_date`;
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
  sql += ` , $13`;
  sql += ` , $14`;
  sql += ` , now()`;
  sql += ` )`;

  return await dbClient.query(sql, pram);
};
