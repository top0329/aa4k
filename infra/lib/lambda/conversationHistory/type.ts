import { z } from "zod";
import { DeviceDiv, MessageType } from "../utils/type";

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
  messageType: z.nativeEnum(MessageType),
  message: z.string(),
  messageAdditional: z.string().optional(),
  conversationId: z.string().optional(),
  javascriptCode: z.string().optional(),
})
export type InsertRequestBody = z.infer<typeof InsertRequestBodySchema>;

