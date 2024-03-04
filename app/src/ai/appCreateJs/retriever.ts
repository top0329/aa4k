import { Document } from "@langchain/core/documents";
import { BaseRetriever, BaseRetrieverInput } from "langchain/schema/retriever";
import { CodeTemplateRetrieverResponseBody } from "~/types/apiResponse"
import { CallbackManager, parseCallbackConfigArg, } from "@langchain/core/callbacks/manager";
import { patchConfig } from "@langchain/core/runnables"
import { LangchainLogsInsertCallbackHandler, LangchainLogsInsertCallbackHandlerProps } from "../langchainLogsInsertCallbackHandler";

export class CodeTemplateRetriever extends BaseRetriever {
  LangchainLogsInsertProps: LangchainLogsInsertCallbackHandlerProps;
  conversationId: string;

  get lc_namespace() {
    return ["langchain", "retrievers", "base"];
  }
  constructor(LangchainLogsInsertProps: LangchainLogsInsertCallbackHandlerProps, conversationId: string, fields?: BaseRetrieverInput) {
    super(fields);
    this.LangchainLogsInsertProps = LangchainLogsInsertProps;
    this.conversationId = conversationId;
  };

  async getRelevantDocuments(query: string): Promise<Document[]> {
    const handler = new LangchainLogsInsertCallbackHandler(this.LangchainLogsInsertProps);
    const parsedConfig = patchConfig(parseCallbackConfigArg({ callbacks: [handler] }));
    const callbackManager_ = await CallbackManager.configure(parsedConfig.callbacks, this.callbacks, parsedConfig.tags, this.tags, parsedConfig.metadata, this.metadata, { verbose: this.verbose });
    const runManager = await callbackManager_?.handleRetrieverStart(this.toJSON(), query, undefined, undefined, undefined, undefined, parsedConfig.runName);

    // TODO: 「kintone.plugin.app.proxy」でAPI連携する必要がある（プラグイン開発としての準備が整っていないため暫定的に「kintone.proxy」を使用
    const response = await kintone.proxy(
      `${import.meta.env.VITE_API_ENDPOINT}/code_template/retrieve`,
      "POST",
      { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
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
