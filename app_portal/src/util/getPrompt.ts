import { ErrorCode, ErrorMessage, ServiceDiv } from "~/constants"
import { KintoneProxyResponse, KintoneRestAPiError, PromptInfoListResponseBody } from "~/types/apiInterfaces";
import { KintoneError } from "~/util/customErrors";
import { getSubDomain } from "~/util/getSubDomain"

/**
 * LLMプロンプトの取得
 * @returns プロンプト取得結果
 */
export const getPromptInfoList = async () => {

  const resPromptInfoList = await kintone.proxy(
    `${import.meta.env.VITE_API_ENDPOINT}/portal/com/prompt`,
    "POST",
    {
      // @ts-ignore __NPM_PACKAGE_VERSION__はvite.config.tsで定義
      "aa4k-portal-js-version": __NPM_PACKAGE_VERSION__,
      'aa4k-subdomain': getSubDomain(),
    },
    { serviceDivList: Object.values(ServiceDiv) },
  ).catch((resBody: string) => {
    const e = JSON.parse(resBody) as KintoneRestAPiError;
    throw new KintoneError(`${ErrorMessage.E_MSG010}（${ErrorCode.E10007}）\n${e.message}\n(${e.code} ${e.id})`);
  }) as KintoneProxyResponse;
  const [resBody, resStatus] = resPromptInfoList;
  const promptResult = JSON.parse(resBody) as PromptInfoListResponseBody;

  return { promptResult, resStatus };
}