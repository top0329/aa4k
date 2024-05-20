
import { z } from "zod";

export const UpdateRequestBodySchema = z.object({
  templateCodes: z.array(
    z.object({
      templateCodeId: z.string().uuid(),
      templateCodeDescription: z.string(),
      templateCode: z.string(),
    })
  ),
})
export type UpdateRequestBody = z.infer<typeof UpdateRequestBodySchema>
