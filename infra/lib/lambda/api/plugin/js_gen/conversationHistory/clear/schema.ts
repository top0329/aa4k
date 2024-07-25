import { z } from "zod";
import { DeviceDiv } from "../../../../../utils";

// ******************************
// 会話履歴クリア
// ******************************
export const ClearRequestBodySchema = z.object({
  appId: z.union([z.string(), z.number()]),
  userId: z.string(),
  deviceDiv: z.nativeEnum(DeviceDiv),
})
export type ClearRequestBody = z.infer<typeof ClearRequestBodySchema>;

