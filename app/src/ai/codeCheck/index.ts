import { ChatPromptTemplate } from "@langchain/core/prompts"
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { v4 as uuidv4 } from 'uuid';

import { LangchainLogsInsertCallbackHandler } from "../langchainLogsInsertCallbackHandler";
import { openAIModel, getCodingGuidelines, createZodSchema } from "../common"
import { ContractStatus, CodeCheckStatus, ServiceDiv, ErrorCode, ErrorMessage as ErrorMessageConst } from "../../constants"
import { CodeCheckResponse, PromptInfo } from "../../types/ai";
import { LlmError, GuidelineError } from "~/util/customErrors"
import { getPromptInfoList } from "~/util/getPrompt"
import { getApiErrorMessage } from "~/util/getErrorMessage"

/**
 * コードチェック
 *     kintoneガイドラインに違反していないかのチェックをLLMで行う
 * @param code 
 * @param contractStatus 
 * @returns AiResponse
 */
export const codeCheck = async (code: string, pluginId: string, contractStatus: ContractStatus, appId: number, userId: string, promptInfoList?: PromptInfo[]): Promise<CodeCheckResponse> => {

  try {
    const sessionId = uuidv4();
    // --------------------
    // ガイドライン取得
    // --------------------
    const { codingGuideline, secureCodingGuideline } = await getCodingGuidelines();

    // --------------------
  // プロンプト情報の確認
    // --------------------
    let latestPromptInfoList = promptInfoList;
    if (!latestPromptInfoList) {
      // プロンプト情報が取得できていない場合
      const { promptResult, resStatus: resPromptStatus } = await getPromptInfoList(pluginId);
      if (resPromptStatus !== 200) {
        const errorMessage = getApiErrorMessage(resPromptStatus, promptResult.errorCode)
        throw new LlmError(errorMessage)
      }
      latestPromptInfoList = promptResult.promptInfoList;
    }
    const jsCheckPromptInfo = latestPromptInfoList.find(info => info.service_div === ServiceDiv.jsCheck);
    if (!jsCheckPromptInfo) {
      throw new LlmError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00013}）`);
    }

    // --------------------
    // コードチェック
    // --------------------
    const handler = new LangchainLogsInsertCallbackHandler({ pluginId, sessionId, appId, userId });
    const model = openAIModel(pluginId, sessionId, contractStatus);
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", jsCheckPromptInfo.prompt],
      ["human", "kintoneガイドラインに違反していないかチェックしてください"],
    ]);

    // LLMの出力形式を設定
    const zodSchema = createZodSchema(jsCheckPromptInfo, "LLM問い合わせ結果");

    type LLMResponse = z.infer<typeof zodSchema>;
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
      } else if (err.code === "429") {
        // レート制限に引っかかった場合、エラーを出力
        throw new LlmError(`${ErrorMessageConst.E_MSG007}（${ErrorCode.E00011}）`)
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
