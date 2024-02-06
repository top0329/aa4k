import { DeviceDiv, ContractDiv } from "./index"
import { DocumentInterface } from "@langchain/core/documents";

// src/types/agents.ts
// メッセージ種別
export const MessageType = {
  human: "human",
  ai: "ai",
  system: "system",
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
}

export interface SystemMessage extends ChatMessage {
  role: "system";
}

export type Context = Record<string, any>;
export type ChatHistory = Array<ChatMessage>;
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
  contractDiv: ContractDiv;
  isGuestSpace: boolean;
  systemSettings: SystemSettings;
}
export interface Conversation {
  message: HumanMessage;
  chatHistory?: ChatHistory;
  context?: AppCreateJsContext;
}

export interface AiResponse {
  message: AiMessage | SystemMessage;
  callbacks?: Function[];
}

export interface CodeCheckResponse {
  method: CodeCheckMethod;
  message: string;
}


export const CodeCreateMethod = {
  create: "CREATE",
  add: "ADD",
  update: "UPDATE",
  delete: "DELETE",
} as const;

export const CodeCheckMethod = {
  caution: "CAUTION",
  none: "NONE",
} as const;
export type CodeCheckMethod = (typeof CodeCheckMethod)[keyof typeof CodeCheckMethod];


export interface kintoneFormFields {
  properties: Record<string, any>;
  revision: string;
}
export interface GeneratedCodeGetResponse {
  javascriptCode: string
}


export interface CodeTemplateRetrieverResponse {
  documents: [DocumentInterface, number][]
}