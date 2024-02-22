import { SuguresMessageType } from "./constants"
// ------------------------------
// スグレス リクエスト
// ------------------------------
// スグレス メッセージAPI
export interface SuguresMessageRequest {
  time: string;
  platformId: string;
  sessionId: string;
  reason: string;
  message: string;
}
// スグレス ポストバックAPI
export interface SuguresPostbackRequest {
  time: string;
  platformId: string;
  sessionId: string;
  key: string;
}


// ------------------------------
// スグレス レスポンス
// ------------------------------
// メッセージ種別
export interface SuguresMessage {
  type: SuguresMessageType;
}
// Action型
export interface SuguresAction extends SuguresMessage {
  label: string;
  type: "postback";
  key: string;
}
// ConfirmMessage型
export interface SuguresConfirmMessage extends SuguresMessage {
  type: 'confirm'; // メッセージ種別
  yes: SuguresAction; // 選択肢: Yes
  no: SuguresAction; // 選択肢: No
}
// TextMessage型
export interface SuguresTextMessage extends SuguresMessage {
  type: "text";
  text: string;
}
// ChoicesMessage型
export interface SuguresChoicesMessage extends SuguresMessage {
  type: "choices";
  actions: SuguresAction[];
}
// メッセージはSuguresTextMessageまたはSuguresChoicesMessageのSuguresConfirmMessageのいずれか
export type SuguresMessageUnion = SuguresTextMessage | SuguresChoicesMessage | SuguresConfirmMessage;

// レスポンス型
export interface SuguresResponse {
  id: string;
  messages: SuguresMessageUnion[];
}



// ------------------------------
// スグレス ポストバックキー情報(for Redis)
// ------------------------------
// スグレス ポストバックキー情報のKey
export type SuguresPostbackResultKey = "sessionId" | "wasHelpfulPostbackKeys" | "wasNotHelpfulPostbackKeys";
// スグレス ポストバックキー情報取得クエリ結果行
export type SuguresPostbackResultRow = Record<SuguresPostbackResultKey, string>;
