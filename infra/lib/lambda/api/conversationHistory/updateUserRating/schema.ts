import { z } from "zod";
import { UserRating } from "../../../utils";

// ******************************
// ユーザー評価更新
// ******************************
export const UpdateUserRatingRequestBodySchema = z.object({
  conversationId: z.string(),
  userRating: z.nativeEnum(UserRating).optional(),
  userRatingComment: z.string().optional(),
})
export type UpdateUserRatingRequestBody = z.infer<typeof UpdateUserRatingRequestBodySchema>;

