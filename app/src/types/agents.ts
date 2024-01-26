// src/types/agents.ts
export type MessageType = "human" | "ai" | "system";
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

export interface Conversation {
  message: HumanMessage;
  chatHistory?: ChatHistory;
  context?: Context;
}
