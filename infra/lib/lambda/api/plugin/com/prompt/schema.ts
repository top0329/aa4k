import { z } from "zod";

// リクエストボディ
// ******************************
// プロンプト取得API
// ******************************
export const PromptRequestBodySchema = z.object({
  serviceDivList: z.array(z.string()),
})
export type PromptRequestBody = z.infer<typeof PromptRequestBodySchema>;
