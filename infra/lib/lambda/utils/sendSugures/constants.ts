// ポストバック保存用のRedisキーのプレフィックス
export const SuguresPostbackPrefix = "suguresPostback"

// メッセージ種別
export const SuguresMessageType = {
  text: "text",
  postback: "postback",
  choices: "choices",
  confirm: "confirm",
} as const;
export type SuguresMessageType = keyof typeof SuguresMessageType
