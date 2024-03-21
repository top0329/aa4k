import { DocumentInterface } from "@langchain/core/documents";
import { ContractStatus, UserRating, ErrorCode } from "~/constants";
import { SystemSettings } from "./ai";

export type ResponseHeaders = Record<string, any>;
export type KintoneProxyResponse = [string, number, ResponseHeaders];
export interface KintoneRestAPiError {
  id: string;
  code: string;
  message: string;
}
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
  documents: DocumentInterface[];
}

export interface InsertConversationResponseBody
  extends KintoneProxyResponseBody {
  conversationId: string;
}

export interface SpeechResponseBody
  extends KintoneProxyResponseBody {
  data: string;
}

export interface AzureOpenAiProxyCredentialResponseBody
  extends KintoneProxyResponseBody {
  AccessKeyId: string
  SecretAccessKey: string
  SessionToken?: string
}