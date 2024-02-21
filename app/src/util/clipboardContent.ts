import { AiMessage, ErrorMessage, MessageType } from "~/types/ai";

// src/utils/clipboardContent.ts
export const createClipboardContent = (message: AiMessage | ErrorMessage) => {
  let content = `${message.content}`;
  if (message.role === MessageType.ai && message.comment) {
    content += `\n${message.comment}`;
  }
  return content;
};
