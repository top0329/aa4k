import { DocumentInterface } from "@langchain/core/documents";
import { ContractStatus, UserRating, ErrorCode } from "~/constants";
import { SystemSettings } from "./ai";

export type ResponseHeaders = Record<string, any>;
export type KintoneProxyResponse = [string, number, ResponseHeaders];

export interface KintoneProxyResponseBody {
  message: string;
  errorCode: ErrorCode;
}

export interface ConversationHistoryRow {
  id: string;
  user_message: string;
  ai_message: string;
  ai_message_comment: string;
  error_message: string;
  user_rating: UserRating;
}

export type ConversationHistory = Array<ConversationHistoryRow>;
export interface ConversationHistoryListResponseBody
  extends KintoneProxyResponseBody {
  desktopConversationHistoryList: ConversationHistory;
  mobileConversationHistoryList: ConversationHistory;
}

export interface PreCheckResponseBody extends KintoneProxyResponseBody {
  contractStatus: ContractStatus;
  systemSettings: SystemSettings;
}

export interface GeneratedCodeGetResponseBody extends KintoneProxyResponseBody {
  javascriptCode: string;
}

export interface CodeTemplateRetrieverResponseBody
  extends KintoneProxyResponseBody {
  documents: [DocumentInterface, number][];
}

export interface InsertConversationResponseBody
  extends KintoneProxyResponseBody {
  conversationId: string;
}
