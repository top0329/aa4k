import { Serialized } from "@langchain/core/load/serializable";
import { AgentAction, AgentFinish, ChainValues, LLMResult, BaseMessage, ChatGenerationChunk, GenerationChunk } from "langchain/schema";
import { Document } from "langchain/document"
export type HandleLLMNewTokenCallbackFields = {
  chunk?: GenerationChunk | ChatGenerationChunk;
};

export const langchainCallbacks = {
  handleLLMStart: function (llm: Serialized, prompts: string[], runId: string, parentRunId?: string | undefined, extraParams?: Record<string, unknown> | undefined, ) {
    console.log("-----handleLLMStart")
    console.log(llm.id[3])
    console.log(runId)
    console.log(parentRunId)
    console.log(prompts)
    console.log(llm)
    console.log(extraParams)
    console.log("------------------------------------------------------------------------------------------")
  },
  // handleLLMNewToken: async function(token: string, idx: NewTokenIndices, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined, fields?: HandleLLMNewTokenCallbackFields | undefined) {
  //   console.log("-----handleLLMNewToken")
  //   console.log(arguments)
  //   console.log("------------------------------------------------------------------------------------------")
  // },
  handleLLMError: function (err: any, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleLLMError")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(err)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleLLMEnd: function (output: LLMResult, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleLLMEnd")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(output.generations[0][0].text)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleChatModelStart: function (llm: Serialized, messages: BaseMessage[][], runId: string, parentRunId?: string | undefined, extraParams?: Record<string, unknown> | undefined) {
    console.log("-----handleChatModelStart")
    console.log(llm.id[3])
    console.log(runId)
    console.log(parentRunId)
    console.log(messages)
    console.log(llm)
    console.log(extraParams)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleChainStart: function (chain: Serialized, inputs: ChainValues, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleChainStart")
    console.log(chain.id[3])
    console.log(runId)
    console.log(parentRunId)
    console.log(inputs)
    console.log(chain)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleChainError: function (err: any, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleChainError")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(err)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleChainEnd: function (outputs: ChainValues, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleChainEnd")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(outputs)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleToolStart: function (tool: Serialized, input: string, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleToolStart")
    console.log(tool.id[2])
    console.log(runId)
    console.log(parentRunId)
    console.log(input)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleToolError: function (err: any, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleToolError")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(err)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleToolEnd: function (output: string, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleToolEnd")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(output)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleText: function (text: string, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleText")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(text)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleAgentAction: function (action: AgentAction, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleAgentAction")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(action)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleAgentEnd: function (action: AgentFinish, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleAgentEnd")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(action)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleRetrieverStart: function (retriever: Serialized, query: string, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleRetrieverStart")
    console.log(query)
    console.log(runId)
    console.log(parentRunId)
    console.log(retriever)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleRetrieverEnd: function (documents: Document<Record<string, any>>[], runId: string, parentRunId?: string | undefined) {
    console.log("-----handleRetrieverEnd")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(documents)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
  handleRetrieverError: function (err: any, runId: string, parentRunId?: string | undefined) {
    console.log("-----handleRetrieverError")
    console.log(null)
    console.log(runId)
    console.log(parentRunId)
    console.log(err)
    console.log(null)
    console.log(null)
    console.log("------------------------------------------------------------------------------------------")
  },
}