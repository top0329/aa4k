import { Document } from "@langchain/core/documents";
import {
  BaseRetriever,
  type BaseRetrieverInput,
} from "@langchain/core/retrievers";
import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";

import { KintoneProxyResponse, CodeTemplateRetrieverResponseBody } from "~/types/apiResponse"
import { CallbackManager, parseCallbackConfigArg, } from "@langchain/core/callbacks/manager";
import { patchConfig } from "@langchain/core/runnables"
import { LangchainLogsInsertCallbackHandler, LangchainLogsInsertCallbackHandlerProps } from "../langchainLogsInsertCallbackHandler";
import { getApiErrorMessageForCreateJs } from "~/util/getErrorMessage"
import { RetrieveError } from "~/util/customErrors"
import { ErrorCode, ErrorMessage } from "~/constants"

export interface CodeTemplateRetrieverInput extends BaseRetrieverInput {
  LangchainLogsInsertProps: LangchainLogsInsertCallbackHandlerProps;
  pluginId: string;
  conversationId: string;
}
export class CodeTemplateRetriever extends BaseRetriever {
  lc_namespace = ["langchain", "retrievers"];
  static lc_name() {
    return "CodeTemplateRetriever";
  }
  LangchainLogsInsertProps: LangchainLogsInsertCallbackHandlerProps;
  pluginId: string;
  conversationId: string;

  constructor(fields: CodeTemplateRetrieverInput) {
    super(fields);
    this.pluginId = fields.pluginId
    this.conversationId = fields.conversationId;
    this.LangchainLogsInsertProps = fields.LangchainLogsInsertProps;
  };

  async _getRelevantDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun
  ): Promise<Document[]> {
    const handler = new LangchainLogsInsertCallbackHandler(this.LangchainLogsInsertProps);
    const parsedConfig = patchConfig(parseCallbackConfigArg({ callbacks: [handler] }));
    const callbackManager_ = await CallbackManager.configure(parsedConfig.callbacks, this.callbacks, parsedConfig.tags, this.tags, parsedConfig.metadata, this.metadata, { verbose: this.verbose });
    runManager = await callbackManager_?.handleRetrieverStart(this.toJSON(), query, undefined, undefined, undefined, undefined, parsedConfig.runName);

    const response = await kintone.plugin.app.proxy(
      this.pluginId,
      `${import.meta.env.VITE_API_ENDPOINT}/plugin/com/code_template/retrieve`,
      "POST",
      {},
      {
        query: query,
        conversationId: this.conversationId,
      },
    ) as KintoneProxyResponse;
    const [resBody, resStatus] = response;
    const resJson = JSON.parse(resBody) as CodeTemplateRetrieverResponseBody;
    if (resStatus !== 200) {
      const errorMessage = resJson.errorCode === ErrorCode.A05003 ? `${ErrorMessage.E_MSG003}（${resJson.errorCode}）` : getApiErrorMessageForCreateJs(resStatus, resJson.errorCode)
      throw new RetrieveError(errorMessage)
    }
    await runManager?.handleRetrieverEnd(resJson.documents);
    return resJson.documents
  }
}
