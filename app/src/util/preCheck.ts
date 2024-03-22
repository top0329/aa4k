import { ErrorCode, ErrorMessage } from "~/constants"
import { KintoneProxyResponse, KintoneRestAPiError, PreCheckResponseBody } from "~/types/apiResponse";
import { KintoneError } from "~/util/customErrors";

/**
 * 事前チェック
 * @returns 事前チェック結果
 */
export async function preCheck(pluginId: string) {
  const resPreCheck = await kintone.plugin.app.proxy(
    pluginId,
    `${import.meta.env.VITE_API_ENDPOINT}/pre_check`,
    "POST",
    {},
    {},
  ).catch(async (resBody: string) => {
    const e = JSON.parse(resBody) as KintoneRestAPiError;
    throw new KintoneError(`${ErrorMessage.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`);
  }) as KintoneProxyResponse;
  const [resBody, resStatus] = resPreCheck;
  const preCheckResult = JSON.parse(resBody) as PreCheckResponseBody;

  return { preCheckResult, resStatus };
}
