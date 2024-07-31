import { z } from "zod";

// ******************************
// 会話履歴取得
// ******************************
export const ListRequestBodySchema = z.object({
  appId: z.union([z.string(), z.number()]),
  userId: z.string(),
})
export type ListRequestBody = z.infer<typeof ListRequestBodySchema>;