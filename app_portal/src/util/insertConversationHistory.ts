import { getSubDomain } from "~/util/getSubDomain"
import { KintoneProxyResponse, InsertConversationRequest } from "~/types/apiInterfaces";
/**
 * 会話履歴の登録
 * @param reqBody
 */
export const insertConversation = async (reqBody: InsertConversationRequest) => {

  const resConversation = await kintone.proxy(
    `${import.meta.env.VITE_API_ENDPOINT}/portal/app_gen/conversation_history/insert`,
    "POST",
    {
      // @ts-ignore __NPM_PACKAGE_VERSION__はvite.config.tsで定義
      "aa4k-portal-js-version": __NPM_PACKAGE_VERSION__,
      'aa4k-subdomain': getSubDomain(),
    },
    reqBody,
  ) as KintoneProxyResponse;
  return resConversation;
}
