import { Serialized } from "@langchain/core/load/serializable";
import { AgentAction, AgentFinish, ChainValues, LLMResult, BaseMessage } from "langchain/schema";
import { Document } from "langchain/document"
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

export interface LangchainLogsInsertCallbackHandlerProps {
  sessionId: string;
  appId: number;
  userId: string;
  conversationId?: string;
}

export class LangchainLogsInsertCallbackHandler extends BaseCallbackHandler {
  props: LangchainLogsInsertCallbackHandlerProps;
  name = "LangchainLogsInsertCallbackHandler";
  constructor(props: LangchainLogsInsertCallbackHandlerProps) {
    super();
    this.props = props;
  };

  handleLLMStart(llm: Serialized, prompts: string[], runId: string, parentRunId?: string | undefined, extraParams?: Record<string, unknown> | undefined,) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleLLMStart", // handle_name
      llm.id.slice(-1)[0],  // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(prompts),  // content
      JSON.stringify(llm),  // metadata_langchain_params
      JSON.stringify(extraParams),  // metadata_extra_params
      0  // tokens
    )
  }

  handleLLMError(err: any, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleLLMError", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(err),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleLLMEnd(output: LLMResult, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleLLMEnd", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(output), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleChatModelStart(llm: Serialized, messages: BaseMessage[][], runId: string, parentRunId?: string | undefined, extraParams?: Record<string, unknown> | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleChatModelStart", // handle_name
      llm.id.slice(-1)[0],  // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(messages), // content
      JSON.stringify(llm),  // metadata_langchain_params
      JSON.stringify(extraParams),  // metadata_extra_params
      0  // tokens
    )
  }
  handleChainStart(chain: Serialized, inputs: ChainValues, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleChainStart", // handle_name
      chain.id.slice(-1)[0],  // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(inputs), // content
      JSON.stringify(chain),  // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleChainError(err: any, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleChainError", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(err),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleChainEnd(outputs: ChainValues, runId: string, parentRunId?: string | undefined) {
    // トークン計算(出力)


    // ログ登録
    langchainLogInsert(
      this.props,
      "handleChainEnd", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(outputs),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleToolStart(tool: Serialized, input: string, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleToolStart",  // handle_name
      tool.id.slice(-1)[0], // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(input),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleToolError(err: any, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleToolError",  // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(err),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleToolEnd(output: string, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleToolEnd",  // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(output), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleText(text: string, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleText", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(text), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleAgentAction(action: AgentAction, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleAgentAction",  // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(action), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleAgentEnd(action: AgentFinish, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleAgentEnd", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(action), // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleRetrieverStart(retriever: Serialized, query: string, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleRetrieverStart", // handle_name
      retriever.id.slice(-1)[0],  // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(query),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleRetrieverEnd(documents: Document<Record<string, any>>[], runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleRetrieverEnd", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(documents),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
  handleRetrieverError(err: any, runId: string, parentRunId?: string | undefined) {
    // ログ登録
    langchainLogInsert(
      this.props,
      "handleRetrieverError", // handle_name
      "", // run_name
      runId,  // run_id
      parentRunId ? parentRunId : "", // parent_run_id
      JSON.stringify(err),  // content
      "", // metadata_langchain_params
      "", // metadata_extra_params
      0  // tokens
    )
  }
}

/**
 * Langchainログ登録
 * @param props 
 * @param handleName 
 * @param runName 
 * @param runId 
 * @param parentRunId 
 * @param content 
 * @param metadataLangChainParams 
 * @param metadataExtraParams 
 * @param tokens 
 */
export const langchainLogInsert = (props: LangchainLogsInsertCallbackHandlerProps, handleName: string, runName: string, runId: string, parentRunId: string, content: string, metadataLangChainParams: string, metadataExtraParams: string, tokens: number) => {
  const body = {
    app_id: props.appId,
    user_id: props.userId,
    session_id: props.sessionId,
    conversation_id: props.conversationId ? props.conversationId : "",
    handle_name: handleName,
    run_name: runName,
    run_id: runId,
    parent_run_id: parentRunId,
    content: content,
    metadata_lang_chain_params: metadataLangChainParams,
    metadata_extra_params: metadataExtraParams,
    tokens: tokens,
  }
  // TODO: 「kintone.plugin.app.proxy」でAPI連携する必要がある（プラグイン開発としての準備が整っていないため暫定的に「kintone.proxy」を使用
  kintone.proxy(
    `${import.meta.env.VITE_API_ENDPOINT}/langchain_log`,
    "POST",
    { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
    body,
  );
}
