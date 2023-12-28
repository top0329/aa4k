import { z } from "zod";

// リクエストヘッダ
export interface RequestHeaders {
  "subscription_id": string,
  "api_kye": string
}

// ******************************
// Retrive
// ******************************
// リクエストボディ
export const RetriveRequestBodySchema = z.object({
  query: z.string(),
  k: z.number().optional(),
})
export type RetriveRequestBody = z.infer<typeof RetriveRequestBodySchema>

// ******************************
// 登録
// ******************************
export const InsertRequestBodySchema = z.array(
  z.object({
    templateCodeDescription: z.string(),
    templateCode: z.string(),
  })
)
export type InsertRequestBody = z.infer<typeof InsertRequestBodySchema>

// ******************************
// 更新
// ******************************
export const UpdateRequestBodySchema = z.array(
  z.object({
    templateCodeId: z.string().uuid(),
    templateCodeDescription: z.string(),
    templateCode: z.string(),
  })
)
export type UpdateRequestBody = z.infer<typeof UpdateRequestBodySchema>

// ******************************
// 削除
// ******************************
export const DeleteRequestBodySchema = z.array(
  z.object({
    templateCodeId: z.string().uuid(),
  })
)
export type DeleteRequestBody = z.infer<typeof DeleteRequestBodySchema>
