import { ChatPromptTemplate } from "@langchain/core/prompts"
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { CODE_CHECK_SYSTEM_PROMPT } from "./prompt"
import { langchainCallbacks } from "../langchainCallbacks";
import { openAIModel, getCodingGuideLineList } from "../common"
import { ContractDiv } from "../../types"
import { CodeCheckResponse, CodeCheckMethod } from "../../types/ai";

// カスタムエラーオブジェクト
export class LlmError extends Error { }

/**
 * コードチェック
 *     kintoneガイドラインに違反していないかのチェックをLLMで行う
 * @param code 
 * @param contractDiv 
 * @returns AiResponse
 */
export const codeCheck = async (code: string, contractDiv: ContractDiv): Promise<CodeCheckResponse> => {

  try {
    // --------------------
    // ガイドライン取得
    // --------------------
    const { codingGuideLine, secureCodingGuideline } = await getCodingGuideLineList();

    // --------------------
    // コードチェック
    // --------------------
    const handler = BaseCallbackHandler.fromMethods({ ...langchainCallbacks });
    const model = openAIModel(contractDiv);
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", CODE_CHECK_SYSTEM_PROMPT],
      ["human", "kintoneガイドラインに違反していないチェックしてください"],
    ]);

    // LLMの出力形式を設定
    const zodSchema = z.object({
      method: z.nativeEnum(CodeCheckMethod).describe("メソッド"),
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
      codingGuideLine: codingGuideLine,
      secureCodingGuideline: secureCodingGuideline,
    }, { callbacks: [handler] })) as LLMResponse;

    // 終了
    return {
      method: llmResponse.method,
      message: llmResponse.message
    };

  } catch (err) {
    // エラーの場合は、ガイドライン違反なしとして扱う
    return { method: CodeCheckMethod.none, message: "" };
  }
}
