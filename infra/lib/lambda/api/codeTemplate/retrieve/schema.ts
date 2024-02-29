
import { z } from "zod";

export const RetrieveRequestBodySchema = z.object({
  query: z.string(),
  conversationId: z.string(),
  k: z.number().optional(),
})
export type RetrieveRequestBody = z.infer<typeof RetrieveRequestBodySchema>
