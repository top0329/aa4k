import { z } from "zod";

// リクエストボディ
export const SpeechRequestBodySchema = z.object({
  text: z.string(),
})
export type SpeechRequestBody = z.infer<typeof SpeechRequestBodySchema>;
