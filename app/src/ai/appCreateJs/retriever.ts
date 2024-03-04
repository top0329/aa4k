import { Document } from "@langchain/core/documents";
import { BaseRetriever, BaseRetrieverInput } from "langchain/schema/retriever";
import { CodeTemplateRetrieverResponseBody } from "~/types/apiResponse"
import { CallbackManager, parseCallbackConfigArg, } from "@langchain/core/callbacks/manager";
import { patchConfig } from "@langchain/core/runnables"
import { LangchainLogsInsertCallbackHandler, LangchainLogsInsertCallbackHandlerProps } from "../langchainLogsInsertCallbackHandler";

export class CodeTemplateRetriever extends BaseRetriever {
  LangchainLogsInsertProps: LangchainLogsInsertCallbackHandlerProps;
  pluginId: string;
  conversationId: string;

  get lc_namespace() {
    return ["langchain", "retrievers", "base"];
  }
  constructor(LangchainLogsInsertProps: LangchainLogsInsertCallbackHandlerProps, pluginId: string, conversationId: string, fields?: BaseRetrieverInput) {
    super(fields);
    this.LangchainLogsInsertProps = LangchainLogsInsertProps;
    this.pluginId = pluginId;
    this.conversationId = conversationId;
  };

  async getRelevantDocuments(query: string): Promise<Document[]> {
    const handler = new LangchainLogsInsertCallbackHandler(this.LangchainLogsInsertProps);
    const parsedConfig = patchConfig(parseCallbackConfigArg({ callbacks: [handler] }));
    const callbackManager_ = await CallbackManager.configure(parsedConfig.callbacks, this.callbacks, parsedConfig.tags, this.tags, parsedConfig.metadata, this.metadata, { verbose: this.verbose });
    const runManager = await callbackManager_?.handleRetrieverStart(this.toJSON(), query, undefined, undefined, undefined, undefined, parsedConfig.runName);

    const response = await kintone.plugin.app.proxy(
      this.pluginId,
      `${import.meta.env.VITE_API_ENDPOINT}/code_template/retrieve`,
      "POST",
      {},
      {
        query: query,
        conversationId: this.conversationId,
      },
    );
    const resJson = JSON.parse(response[0]) as CodeTemplateRetrieverResponseBody;
    await runManager?.handleRetrieverEnd(resJson.documents);
    return resJson.documents
  }
}
