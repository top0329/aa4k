
import { z } from "zod";

export const InsertRequestBodySchema = z.object({
  templateCodes: z.array(
    z.object({
      templateCodeDescription: z.string(),
      templateCode: z.string(),
    })
  ),
  refresh: z.boolean().optional(),
})
export type InsertRequestBody = z.infer<typeof InsertRequestBodySchema>
