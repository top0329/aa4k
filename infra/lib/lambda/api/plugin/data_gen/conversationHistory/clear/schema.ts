import { z } from "zod";

// ******************************
// 会話履歴クリア
// ******************************
export const ClearRequestBodySchema = z.object({
  appId: z.union([z.string(), z.number()]),
  userId: z.string(),
})
export type ClearRequestBody = z.infer<typeof ClearRequestBodySchema>;

