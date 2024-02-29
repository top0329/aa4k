import { SuguresMessageRequest, SuguresPostbackRequest, SuguresResponse } from "./type"

/**
 * スグレス メッセージAPI送信
 * @param query 
 * @param sessionId 
 * @returns suguresResult.json()
 */
export const sendSuguresMessage = async (url: string, query: string, subscriptionId: string, sessionId: string): Promise<SuguresResponse> => {
  const nowDate = new Date();

  const reqBody = {
    "time": nowDate.toISOString(),
    "platformId": subscriptionId,
    "sessionId": sessionId,
    "reason": "manual",
    "message": query
  } as SuguresMessageRequest;
  const suguresResult = await fetch(url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    },
  )
  return suguresResult.json();
}

/**
 * スグレス ポストバックAPI送信
 * @param key 
 * @param sessionId 
 * @returns postbackResponse.json()
 */
export const sendSuguresPostback = async (url: string, key: string, subscriptionId: string, sessionId: string): Promise<SuguresResponse> => {
  const nowDate = new Date();
  const reqBody = {
    "time": nowDate.toISOString(),
    "platformId": subscriptionId,
    "sessionId": sessionId,
    "key": key
  } as SuguresPostbackRequest

  const postbackResponse = await fetch(url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    },
  )
  return postbackResponse.json();
}