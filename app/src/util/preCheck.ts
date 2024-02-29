import { KintoneProxyResponse, PreCheckResponseBody } from "~/types/apiResponse";

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
  ) as KintoneProxyResponse;
  const [resBody, resStatus] = resPreCheck;
  const preCheckResult = JSON.parse(resBody) as PreCheckResponseBody;

  return { preCheckResult, resStatus };
}
