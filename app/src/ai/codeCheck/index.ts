import { ChatPromptTemplate } from "@langchain/core/prompts"
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { v4 as uuidv4 } from 'uuid';

import { CODE_CHECK_SYSTEM_PROMPT } from "./prompt"
import { LangchainLogsInsertCallbackHandler } from "../langchainLogsInsertCallbackHandler";
import { openAIModel, getCodingGuidelines } from "../common"
import { ContractStatus, CodeCheckStatus } from "../../constants"
import { CodeCheckResponse } from "../../types/ai";

// カスタムエラーオブジェクト
export class LlmError extends Error { }

/**
 * コードチェック
 *     kintoneガイドラインに違反していないかのチェックをLLMで行う
 * @param code 
 * @param contractStatus 
 * @returns AiResponse
 */
export const codeCheck = async (code: string, pluginId: string, contractStatus: ContractStatus, appId: number, userId: string): Promise<CodeCheckResponse> => {

  try {
    const sessionId = uuidv4();
    // --------------------
    // ガイドライン取得
    // --------------------
    const { codingGuideline, secureCodingGuideline } = await getCodingGuidelines();

    // --------------------
    // コードチェック
    // --------------------
    const handler = new LangchainLogsInsertCallbackHandler({ pluginId, sessionId, appId, userId });
    const model = openAIModel(pluginId, contractStatus);
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", CODE_CHECK_SYSTEM_PROMPT],
      ["human", "kintoneガイドラインに違反していないかチェックしてください"],
    ]);

    // LLMの出力形式を設定
    const zodSchema = z.object({
      result: z.nativeEnum(CodeCheckStatus).describe("結果"),
      message: z.string().describe("メッセージ"),
    }).describe("LLM問い合わせ結果"); type LLMResponse = z.infer<typeof zodSchema>;
    const functionCallingModel = model.bind({
      functions: [
        {
          name: "output_formatter",
          description: "Should always be used to properly format output",
          parameters: zodToJsonSchema(zodSchema),
        },
      ],
      function_call: { name: "output_formatter" },
    });
    const outputParser = new JsonOutputFunctionsParser();
    const chain = prompt.pipe(functionCallingModel).pipe(outputParser);
    const llmResponse = (await chain.invoke({
      targetCode: code,
      codingGuideline: codingGuideline,
      secureCodingGuideline: secureCodingGuideline,
    }, { callbacks: [handler] })) as LLMResponse;

    // 終了
    return {
      result: llmResponse.result,
      message: llmResponse.message
    };

  } catch (err) {
    // エラーの場合は、ガイドライン違反なしとして扱う
    return { result: CodeCheckStatus.safe, message: "" };
  }
}
