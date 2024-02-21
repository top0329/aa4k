import { AiMessage, ChatHistoryItem, ErrorMessage } from "./ai";

export type ChatContentProps = {
  aiMessage: AiMessage | ErrorMessage;
  chatHistoryItem: ChatHistoryItem;
};
