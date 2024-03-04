import { z } from "zod";

// リクエストボディ
// スキーマを定義する
export const LogLangchainRequestBodySchema = z.object({
  app_id: z.union([z.string(), z.number()]),
  user_id: z.string(),
  session_id: z.string().max(36),
  conversation_id: z.string().optional(),
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
  subscriptionId: string,
  body: LogLangchainRequestBody,
  currentDate: string,
}