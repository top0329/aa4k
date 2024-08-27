import { getSubDomain } from "~/util/getSubDomain"
import { ErrorCode, ErrorMessage } from "~/constants"
import { KintoneProxyResponse, KintoneRestAPiError, PreCheckResponseBody } from "~/types/apiInterfaces";
import { KintoneError } from "~/util/customErrors";

/**
 * 事前チェック
 * @returns 事前チェック結果
 */
export async function preCheck() {
  const resPreCheck = await kintone.proxy(
    `${import.meta.env.VITE_API_ENDPOINT}/portal/com/pre_check`,
    "POST",
    {
      // @ts-ignore __NPM_PACKAGE_VERSION__はvite.config.tsで定義
      "aa4k-portal-js-version": __NPM_PACKAGE_VERSION__,
      'aa4k-subdomain': getSubDomain(),
    },
    {},
  ).catch(async (resBody: string) => {
    const e = JSON.parse(resBody) as KintoneRestAPiError;
    throw new KintoneError(`${ErrorMessage.E_MSG010}（${ErrorCode.E10004}）\n${e.message}\n(${e.code} ${e.id})`);
  }) as KintoneProxyResponse;
  const [resBody, resStatus] = resPreCheck;
  const preCheckResult = JSON.parse(resBody) as PreCheckResponseBody;

  return { preCheckResult, resStatus };
}
