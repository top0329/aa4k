import { z } from "zod";
import { DeviceDiv } from "../../../utils";

// ******************************
// 会話履歴取得
// ******************************
export const ListRequestBodySchema = z.object({
  appId: z.union([z.string(), z.number()]),
  userId: z.string(),
  deviceDiv: z.nativeEnum(DeviceDiv),
})
export type ListRequestBody = z.infer<typeof ListRequestBodySchema>;