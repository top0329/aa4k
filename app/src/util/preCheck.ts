import { KintoneProxyResponse, PreCheckResponseBody } from "~/types/apiResponse";

/**
 * 事前チェック
 * @returns 事前チェック結果
 */
export async function preCheck() {
  const resPreCheck = await kintone.proxy(
    `${import.meta.env.VITE_API_ENDPOINT}/pre_check`,
    "POST",
    { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
    {},
  ) as KintoneProxyResponse;
  const [resBody, resStatus] = resPreCheck;
  const preCheckResult = JSON.parse(resBody) as PreCheckResponseBody;

  return { preCheckResult, resStatus };
}
