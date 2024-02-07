import { DeviceDiv, ContractStatus } from "~/constants";

// src/types/agents.ts
// メッセージ種別
export const MessageType = {
  human: "human",
  ai: "ai",
  system: "system",
  error: "error",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];
export type MessageContent = string;

export interface ChatMessage {
  role: MessageType;
  content: MessageContent;
}

export interface HumanMessage extends ChatMessage {
  role: "human";
}

export interface AiMessage extends ChatMessage {
  role: "ai";
  comment: MessageContent;
}

export interface SystemMessage extends ChatMessage {
  role: "system";
}

export interface ErrorMessage extends ChatMessage {
  role: "error";
}

export interface ChatHistoryItem {
  human: HumanMessage;
  ai?: AiMessage;
  error?: ErrorMessage;
  conversationId?: string;
}

export type Context = Record<string, any>;
export type ChatHistory = Array<ChatHistoryItem>;
export interface SystemSettings {
  retrieveMaxCount: number;
  retrieveScoreThreshold: number;
  historyUseCount: number;
}
export interface AppCreateJsContext {
  appId: number;
  userId: string;
  conversationId: string;
  deviceDiv: DeviceDiv;
  contractStatus: ContractStatus;
  isGuestSpace: boolean;
  systemSettings: SystemSettings;
}
export interface Conversation {
  message: HumanMessage;
  chatHistory?: ChatHistory;
  context?: AppCreateJsContext;
}

export interface AiResponse {
  message: AiMessage | ErrorMessage;
  callbacks?: Function[];
}

export const CodeCreateMethod = {
  create: "CREATE",
  add: "ADD",
  update: "UPDATE",
  delete: "DELETE",
} as const;

export interface kintoneFormFields {
  properties: Record<string, any>;
  revision: string;
}
