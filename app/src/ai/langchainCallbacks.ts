import { Serialized } from "@langchain/core/load/serializable";
import { AgentAction, AgentFinish, ChainValues, LLMResult, BaseMessage, ChatGenerationChunk, GenerationChunk } from "langchain/schema";
import { Document } from "langchain/document"
export type HandleLLMNewTokenCallbackFields = {
  chunk?: GenerationChunk | ChatGenerationChunk;
};
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";


export class CustomHandler extends BaseCallbackHandler {
  sessionId: string;
  appId: number;
  userId: string;
  conversationId?: string;
  name = "custom_handler";
  constructor(sessionId: string, appId: number, userId: string, conversationId?: string) {
    super();
    this.sessionId = sessionId;
    this.appId = appId;
    this.userId = userId;
    this.conversationId = conversationId;
  };

  handleLLMStart(llm: Serialized, prompts: string[], runId: string, parentRunId?: string | undefined, extraParams?: Record<string, unknown> | undefined,) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleLLMStart", // handle_name
      llm.id.slice(-1)[0],  // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(prompts),  // content
      JSON.stringify(llm),  // metadata_langchain_params
      JSON.stringify(extraParams),  // metadata_extra_params
      ""  // tokens
    )
  }

  handleLLMError(err: any, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleLLMError", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(err),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleLLMEnd(output: LLMResult, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleLLMEnd", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(output), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleChatModelStart(llm: Serialized, messages: BaseMessage[][], runId: string, parentRunId?: string | undefined, extraParams?: Record<string, unknown> | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleChatModelStart", // handle_name
      llm.id.slice(-1)[0],  // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(messages), // content
      JSON.stringify(llm),  // metadata_langchain_params
      JSON.stringify(extraParams),  // metadata_extra_params
      ""  // tokens
    )
  }
  handleChainStart(chain: Serialized, inputs: ChainValues, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleChainStart", // handle_name
      chain.id.slice(-1)[0],  // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(inputs), // content
      JSON.stringify(chain),  // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleChainError(err: any, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleChainError", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(err),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleChainEnd(outputs: ChainValues, runId: string, parentRunId?: string | undefined) {
    // トークン計算(出力)


    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleChainEnd", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(outputs),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleToolStart(tool: Serialized, input: string, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleToolStart",  // handle_name
      tool.id.slice(-1)[0], // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(input),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleToolError(err: any, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleToolError",  // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(err),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleToolEnd(output: string, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleToolEnd",  // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(output), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleText(text: string, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleText", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(text), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleAgentAction(action: AgentAction, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleAgentAction",  // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(action), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleAgentEnd(action: AgentFinish, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleAgentEnd", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(action), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleRetrieverStart(retriever: Serialized, query: string, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleRetrieverStart", // handle_name
      retriever.id.slice(-1)[0],  // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(query),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleRetrieverEnd(documents: Document<Record<string, any>>[], runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleRetrieverEnd", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(documents),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
  handleRetrieverError(err: any, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.appId, // app_id
      this.userId,  // user_id
      this.sessionId, // session_id
      this.conversationId ? this.conversationId : "", // conversation_id
      "handleRetrieverError", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(err),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      ""  // tokens
    )
  }
}

/**
 * Langchainログ登録
 */
export const langchainLogInsert = (appId: number, userId: string, sessionId: string, conversationId: string, handleName: string, runName: string, runId: string, parentRunId: string, content: string, metadataLangChainParams: string, metadataExtraParams: string, tokens: string) => {
  const body = {
    app_id: appId,
    user_id: userId,
    session_id: sessionId,
    conversation_id: conversationId,
    handle_name: handleName,
    run_name: runName,
    run_id: runId,
    parent_run_id: parentRunId,
    content: content,
    metadata_lang_chain_params: metadataLangChainParams,
    metadata_extra_params: metadataExtraParams,
    tokens: tokens ? 0 : 0,
  }
  // TODO: 「kintone.plugin.app.proxy」でAPI連携する必要がある（プラグイン開発としての準備が整っていないため暫定的に「kintone.proxy」を使用
  kintone.proxy(
    `${import.meta.env.VITE_API_ENDPOINT}/langchain_log`,
    "POST",
    { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
    body,
  );
}
