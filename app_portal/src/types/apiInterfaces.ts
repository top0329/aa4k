
import { ContractStatus, ErrorCode } from "~/constants";
import { SystemSettings, PromptInfo } from ".";
import { ActionType } from "~/constants";
// --------------------
// リクエスト定義
// --------------------
// 会話履歴登録API
export interface InsertConversationRequest {
  userId: string;
  sessionId: string;
  actionType?: ActionType;
  userMessage?: string;
  resultMessage?: string;
  resultMessageDetail?: string;
  aiResponse?: string;
  appId?: number;
  conversationId?: string;
}


// --------------------
// レスポンス定義
// --------------------
// 共通
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

// 会話履歴登録API
export interface InsertConversationResponseBody
  extends KintoneProxyResponseBody {
  conversationId: string;
}

export interface PreCheckResponseBody extends KintoneProxyResponseBody {
  contractStatus: ContractStatus;
  systemSettings: SystemSettings;
}

// export interface GeneratedCodeGetResponseBody extends KintoneProxyResponseBody {
//   javascriptCode: string;
// }

// export interface CodeTemplateRetrieverResponseBody
//   extends KintoneProxyResponseBody {
//   documents: DocumentInterface[];
// }


export interface SpeechResponseBody
  extends KintoneProxyResponseBody {
  data: string;
}

// Azure OpenAI Proxy Credential API
export interface AzureOpenAiProxyCredentialResponseBody
  extends KintoneProxyResponseBody {
  AccessKeyId: string
  SecretAccessKey: string
  SessionToken?: string
}

// プロンプト情報
export type PromptInfoList = Array<PromptInfo>;
export interface PromptInfoListResponseBody
  extends KintoneProxyResponseBody {
  promptInfoList: PromptInfoList;
}