import { ErrorCode, ErrorMessage, ServiceDiv } from "~/constants"
import { KintoneProxyResponse, KintoneRestAPiError, PromptInfoListResponseBody } from "~/types/apiResponse";
import { KintoneError } from "~/util/customErrors";

/**
 * LLMプロンプトの取得
 * @returns プロンプト取得結果
 */
export const getPromptInfoList = async (pluginId: string) => {

  const resPromptInfoList = await kintone.plugin.app.proxy(
    pluginId,
    `${import.meta.env.VITE_API_ENDPOINT}/plugin/com/prompt`,
    "POST",
    {},
    { serviceDivList: Object.values(ServiceDiv) },
  ).catch((resBody: string) => {
    const e = JSON.parse(resBody) as KintoneRestAPiError;
    throw new KintoneError(`${ErrorMessage.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`);
  }) as KintoneProxyResponse;
  const [resBody, resStatus] = resPromptInfoList;
  const promptResult = JSON.parse(resBody) as PromptInfoListResponseBody;

  return { promptResult, resStatus };
}