import { DocumentInterface } from "@langchain/core/documents";
import { SystemSettings } from "./ai";
import { ContractStatus, ErrorCode } from "~/constants";

export type ResponseHeaders = Record<string, any>;
export type KintoneProxyResponse = [string, number, ResponseHeaders];

export interface KintoneProxyResponseBody {
  message: string;
  errorCode: ErrorCode;
};

export interface ConversationHistoryRow {
  id: string;
  user_message: string;
  ai_message: string;
  ai_message_comment: string;
  error_message: string;
  user_rating: string;
}

export type ConversationHistory = Array<ConversationHistoryRow>;
export interface ConversationHistoryListResponseBody extends KintoneProxyResponseBody {
  conversationHistoryList: ConversationHistory
};

export interface PreCheckResponseBody extends KintoneProxyResponseBody {
  contractStatus: ContractStatus;
  systemSettings: SystemSettings;
}

export interface GeneratedCodeGetResponseBody extends KintoneProxyResponseBody {
  javascriptCode: string
}

export interface CodeTemplateRetrieverResponseBody extends KintoneProxyResponseBody {
  documents: [DocumentInterface, number][]
}

export interface InsertConversationResponseBody extends KintoneProxyResponseBody {
  conversationId: string;
}