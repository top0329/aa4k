import { ChatOpenAI } from "@langchain/openai";
import { ContractStatus, ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants";
import * as cheerio from "cheerio"
import { KintoneProxyResponse } from "~/types/apiResponse"
import { Fetch } from "openai/core"

// カスタムエラーオブジェクト
export class ContractExpiredError extends Error { }
export class ContractStatusError extends Error { }

/**
 * openAIモデルのインスタンス生成
 * @param pluginId
 * @param contractStatus 
 * @returns new ChatOpenAI
 */
export function openAIModel(pluginId: string, contractStatus: ContractStatus) {
  if (contractStatus === ContractStatus.trial) {

    // トライアル契約
    return new ChatOpenAI({
      temperature: 0,
      modelKwargs: { "seed": 0 },
      modelName: kintone.plugin.app.getConfig(pluginId).targetModel,
      openAIApiKey: "dummy",
    });

  } else if (contractStatus === ContractStatus.active) {
    // 本契約
    return new ChatOpenAI({
      temperature: 0,
      modelKwargs: { "seed": 0 },
      modelName: "gpt-4-1106-preview",
      openAIApiKey: "dummy",  // proxyに任せるのでこの値は不要だが、LangChainの仕様上必須のためセットしている
    }, {
      baseURL: `${import.meta.env.VITE_OPENAI_PROXY_API_ENDPOINT}/openai_proxy/`,
      fetch: kintoneProxyFetcher,
    });
  } else if (contractStatus === ContractStatus.expired) {
    throw new ContractExpiredError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00002}）`)
  } else {
    // @ts-expect-error
    // 変数:unexpectedは使用しないので、エラーを無視する
    const unexpected: never = contractStatus;
    throw new ContractStatusError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00003}）`)
  }
};

/**
 * kintoneコーディングガイドラインの取得
 * @param contractDiv 
 * @returns codingGuideline, secureCodingGuideline
 */
export async function getCodingGuidelines() {
  const urls = [
    "https://cybozu.dev/ja/kintone/docs/guideline/coding-guideline/",
    "https://cybozu.dev/ja/kintone/docs/guideline/secure-coding-guideline/"
  ]
  const [codingGuidelineHtml, secureCodingGuidelineHtml] = await Promise.all(urls.map(url => kintone.proxy(url, "GET", {}, {})));
  const $1 = cheerio.load(codingGuidelineHtml[0]);
  const $2 = cheerio.load(secureCodingGuidelineHtml[0]);
  const codingGuideline = $1("article.main--content--article").text();
  const secureCodingGuideline = $2("article.main--content--article").text();
  return { codingGuideline, secureCodingGuideline }
}


/**
 * Langchainで使用されるfetchのカスタム
 *     kintone.proxyを使用してLambda-openai-proxyにアクセス
 * @param url 
 * @param init 
 * @returns response
 */
const kintoneProxyFetcher: Fetch = async (url, init?) => {

  if (!init?.method) throw new Error(`OpenAIリクエストのmethodが指定されていません`)

  // headers設定
  const reqHeaders: Record<string, string> = {};
  // 既存のヘッダーを新しいheadersオブジェクトにコピー（content-lengthを除外）
  for (const [key, value] of Object.entries(init?.headers || {})) {
    // 下記のkintoneドキュメントより、「Content-Length」と「Transfer-Encoding」の除外が必要
    // https://cybozu.dev/ja/kintone/docs/js-api/proxy/kintone-proxy/
    if (key.toLowerCase() !== 'content-length') {
      reqHeaders[key] = value;
    }
  }
  // 新しいヘッダーを追加 TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
  reqHeaders['aa4k-plugin-version'] = '1.0.0';
  reqHeaders['aa4k-subscription-id'] = '2c2a93dc-4418-ba88-0f89-6249767be821';

  // kintone.proxyにオブジェクトで渡すため、init.bodyをオブジェクト型に変換
  const reqBody = JSON.parse(init?.body ? init.body.toString() : "{}");

  // API連携
  const resProxy = await kintone.proxy(
    url.toString(),
    init.method.toUpperCase(),
    reqHeaders,
    reqBody,
  ) as KintoneProxyResponse;
  const [resBody, resStatus, resHeaders] = resProxy;

  // Fetchに合わせるため、Responseオブジェクトを設定
  const response = new Response(resBody, {
    status: resStatus,
    headers: resHeaders
  });

  return response;
}
