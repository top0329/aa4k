import { z } from "zod";
import { AzureSecretValue } from "../utils/type";

// ******************************
// Retrieve
// ******************************
// リクエストボディ
export const RetrieveRequestBodySchema = z.object({
  query: z.string(),
  k: z.number().optional(),
})
export type RetrieveRequestBody = z.infer<typeof RetrieveRequestBodySchema>

// ******************************
// 登録
// ******************************
export const InsertRequestBodySchema = z.object({
  templateCodes: z.array(
    z.object({
      templateCodeDescription: z.string(),
      templateCode: z.string(),
    })
  ),
})
export type InsertRequestBody = z.infer<typeof InsertRequestBodySchema>

// ******************************
// 更新
// ******************************
export const UpdateRequestBodySchema = z.object({
  templateCodes: z.array(
    z.object({
      templateCodeId: z.string().uuid(),
      templateCodeDescription: z.string(),
      templateCode: z.string(),
    })
  ),
})
export type UpdateRequestBody = z.infer<typeof UpdateRequestBodySchema>

// ******************************
// 削除
// ******************************
export const DeleteRequestBodySchema = z.object({
  templateCodeIds: z.array(
    z.string().uuid(),
  )
})
export type DeleteRequestBody = z.infer<typeof DeleteRequestBodySchema>

export interface pgVectorInitializeOptions {
  azureSecretValue?: AzureSecretValue,
  openAiApiKey?: string,
}
