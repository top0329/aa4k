import { ChatPromptTemplate } from "@langchain/core/prompts"
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { v4 as uuidv4 } from 'uuid';

import { CODE_CHECK_SYSTEM_PROMPT } from "./prompt"
import { LangchainLogsInsertCallbackHandler } from "../langchainLogsInsertCallbackHandler";
import { openAIModel, getCodingGuidelines } from "../common"
import { ContractStatus, CodeCheckStatus, ErrorCode, ErrorMessage as ErrorMessageConst } from "../../constants"
import { CodeCheckResponse } from "../../types/ai";
import { LlmError, GuidelineError } from "~/util/customErrors"

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
    const model = openAIModel(pluginId, sessionId, contractStatus);
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", CODE_CHECK_SYSTEM_PROMPT],
      ["human", "kintoneガイドラインに違反していないかチェックしてください"],
    ]);

    // LLMの出力形式を設定
    const zodSchema = z.object({
      result: z.nativeEnum(CodeCheckStatus).describe("結果"),
      message: z.array(z.string().describe("メッセージ")).describe("メッセージ一覧"),
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
    }, { callbacks: [handler] }).catch((err) => {
      if (err.code === "invalid_api_key") {
        throw new LlmError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00009}）`)
      } else {
        throw new LlmError(`${ErrorMessageConst.E_MSG001}（${ErrorCode.E00005}）`)
      }
    })) as LLMResponse;

    // 終了
    return {
      result: llmResponse.result,
      message: llmResponse.message
    };

  } catch (err) {
    if (err instanceof LlmError || err instanceof GuidelineError) {
      return { result: CodeCheckStatus.error, message: [err.message] }
    } else {
      const message = `${ErrorMessageConst.E_MSG001}（${ErrorCode.E99999}）`;
      return { result: CodeCheckStatus.error, message: [message] }
    }
  }
}
