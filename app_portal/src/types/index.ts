import { MessageType, ActionType, ContractStatus } from "~/constants"
// メッセージ種別
export type MessageContent = string;
export interface ChatMessage {
  role: MessageType;
  content: MessageContent;
}

export interface SystemSettings {
  pluginId: string;
}
export interface HumanMessage extends ChatMessage {
  role: "human";
}

export interface AiMessage extends ChatMessage {
  role: "ai";
  messageDetail?: MessageContent;
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
  conversationId: string;
}
export type Context = Record<string, any>;
export type ChatHistory = Array<ChatHistoryItem>;


// ******************************
// AI機能関連
// ******************************
// フィールド情報
export interface Field {
  label: string;
  type: string;
  displayType:string;
}
// 設定リスト
export interface SettingInfo {
  appName: string;
  fields: Field[]
}
// プロンプト情報
export interface Prompt {
  prompt: string;
}
export interface PromptFunctionParameter {
  item_id: number;
  parent_item_id: number | null;
  item_name: string;
  item_type: string;
  item_describe: string;
  constants: string;
}
export interface PromptInfo extends Prompt {
  service_div: string,
  prompt: string;
  prompt_function_parameter: PromptFunctionParameter[],
}


export interface AppGenerationContext {
  userId: string;
  conversationId: string;
  sessionId: string;
  settingInfo?: SettingInfo;
  contractStatus: ContractStatus;
  promptInfoList?: PromptInfo[]
}
// アプリ作成のプランニング
export interface AppGenerationPlanningContext extends AppGenerationContext {
  // 「アプリ作成のプランニング」独自のものがあればここに定義
  isCreating: boolean;
}
export interface AppGenerationPlanningConversation {
  message: HumanMessage;
  chatHistory?: ChatHistory;
  context?: AppGenerationPlanningContext;
}

export interface AppGenerationPlanningResponse {
  actionType: ActionType;
  message: AiMessage | ErrorMessage;
  settingInfo?: SettingInfo;
  sessionId: string;
  isCreating: boolean;
  callbacks?: Function[];
}


// アプリ作成の実行
export interface AppGenerationExecuteContext extends AppGenerationContext {
  // 「アプリ作成の実行」独自のものがあればここに定義
  isGuestSpace: boolean;
  systemSettings: SystemSettings;
}
export interface AppGenerationExecuteConversation {
  message: HumanMessage;
  chatHistory?: ChatHistory;
  context?: AppGenerationExecuteContext;
}

export interface AppGenerationExecuteResponse {
  result: string;
  callbacks?: Function[];
  errorMessage?:string;
}

export interface AppGenerationExecuteResponseSuccess extends AppGenerationExecuteResponse {
  result: "success";
  callbacks: Function[];
}

export interface AppGenerationExecuteResponseError extends AppGenerationExecuteResponse {
  result: "error";
  errorMessage: string;
}
