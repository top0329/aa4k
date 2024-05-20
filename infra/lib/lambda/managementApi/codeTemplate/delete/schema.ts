
import { z } from "zod";

export const DeleteRequestBodySchema = z.object({
  templateCodeIds: z.array(
    z.string().uuid(),
  )
})
export type DeleteRequestBody = z.infer<typeof DeleteRequestBodySchema>

