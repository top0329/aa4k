import { z } from "zod";
import { DeviceDiv, MessageDiv } from "../utils/type";

// リクエストボディ
// ******************************
// 会話履歴取得
// ******************************
export const ListRequestBodySchema = z.object({
  appId: z.union([z.string(), z.number()]),
  userId: z.string(),
  deviceDiv: z.nativeEnum(DeviceDiv),
})
export type ListRequestBody = z.infer<typeof ListRequestBodySchema>;

// ******************************
// 会話履歴登録
// ******************************
export const InsertRequestBodySchema = z.object({
  appId: z.union([z.string(), z.number()]),
  userId: z.string(),
  deviceDiv: z.nativeEnum(DeviceDiv),
  messageDiv: z.nativeEnum(MessageDiv),
  message: z.string(),
  conversationId: z.string().optional(),
  javascriptCode: z.string().optional(),
})
export type InsertRequestBody = z.infer<typeof InsertRequestBodySchema>;

