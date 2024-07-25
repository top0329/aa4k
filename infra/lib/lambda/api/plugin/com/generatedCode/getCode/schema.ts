import { z } from "zod";
import { DeviceDiv } from "../../../../../utils";

// リクエストボディ
// ******************************
// 最新JS取得
// ******************************
export const GetCodeRequestBodySchema = z.object({
  appId: z.union([z.string(), z.number()]),
  userId: z.string(),
  deviceDiv: z.nativeEnum(DeviceDiv),
  conversationId: z.string(),
})
export type GetCodeRequestBody = z.infer<typeof GetCodeRequestBodySchema>;
