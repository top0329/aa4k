import { z } from "zod";

// メッセージ種別
export const ActionType = {
  create: "create",
  edit: "edit",
  duplicate: "duplicate",
  other: "other",
  complete: "complete",
  error: "error",
} as const;
export type ActionType = keyof typeof ActionType


// ******************************
// 会話履歴登録
// ******************************
export const InsertRequestBodySchema = z.object({
  userId: z.string(),
  sessionId: z.string().uuid(),
  actionType: z.nativeEnum(ActionType).optional(),
  userMessage: z.string().optional(),
  resultMessage: z.string().optional(),
  resultMessageDetail: z.string().optional(),
  aiResponse: z.string().optional(),
  appId: z.union([z.string(), z.number()]).optional(),
  conversationId: z.string().optional(),
})
export type InsertRequestBody = z.infer<typeof InsertRequestBodySchema>;

