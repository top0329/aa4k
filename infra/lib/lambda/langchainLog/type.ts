import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import { z } from "zod";

// リクエストヘッダ
export interface LogLangchainRequestheaders extends APIGatewayProxyEventHeaders {
  subscription_id: string,
}

// リクエストボディ
// スキーマを定義する
export const LogLangchainRequestBodySchema = z.object({
  history_id: z.string().max(36),
  session_id: z.string().max(36),
  handle_name: z.string().max(50),
  run_name: z.string().max(50),
  run_id: z.string().max(36),
  parent_run_id: z.string().max(36).optional(),
  content: z.string(),
  metadata_lang_chain_params: z.string().optional(),
  metadata_extra_params: z.string().optional(),
  tokens: z.number().optional(),
})
export type LogLangchainRequestBody = z.infer<typeof LogLangchainRequestBodySchema>

// Langchain実行ログTBL登録
export interface InsertLangchainProcessLogProps {
  subscription_id: string,
  LogLangchainRequestBody: LogLangchainRequestBody,
  currentDate: string,
}