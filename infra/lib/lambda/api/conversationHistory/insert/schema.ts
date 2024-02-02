import { z } from "zod";
import { DeviceDiv, MessageType } from "../../../utils";

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

