import { APIGatewayProxyEventHeaders } from 'aws-lambda';

// リクエストヘッダ
export interface LogLangchainRequestheaders extends APIGatewayProxyEventHeaders {
  subscription_id: string,
}

// リクエストボディ
export interface LogLangchainRequestBody {
  history_id: string,
  session_id: string,
  handle_name: string,
  run_name: string,
  run_id: string,
  parent_run_id?: string,
  content: string,
  metadata_lang_chain_params?: string,
  metadata_extra_params?: string,
  tokens: string,
}

// Langchain実行ログTBL登録
export interface InsertLangchainProcessLogProps {
  subscription_id: string,
  LogLangchainRequestBody: LogLangchainRequestBody,
  currentDate: string,
}