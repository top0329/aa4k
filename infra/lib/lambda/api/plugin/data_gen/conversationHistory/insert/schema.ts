import { z } from "zod";
import { MessageType } from "../../../../../utils";

// ******************************
// 会話履歴登録
// ******************************
export const InsertRequestBodySchema = z.object({
  appId: z.union([z.string(), z.number()]),
  userId: z.string(),
  messageType: z.nativeEnum(MessageType),
  message: z.string(),
  conversationId: z.string().optional(),
  generated_data: z.string().optional(),
})
export type InsertRequestBody = z.infer<typeof InsertRequestBodySchema>;

