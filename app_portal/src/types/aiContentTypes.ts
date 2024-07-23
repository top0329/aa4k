import { AiMessage, ChatHistoryItem, ErrorMessage } from "~/types";

export type AiContentProps = {
  aiMessage: AiMessage | ErrorMessage;
  chatHistoryItem: ChatHistoryItem;
};
