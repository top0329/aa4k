import { ChatOpenAI } from "@langchain/openai";
import { LlmType, ContractStatus, ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants";
import * as cheerio from "cheerio"
import { KintoneProxyResponse, AzureOpenAiProxyCredentialResponseBody } from "~/types/apiResponse"
import { ContractExpiredError, ContractStatusError, GuidelineError } from "~/util/customErrors"
import { Fetch } from "openai/core"
import { HttpRequest } from '@aws-sdk/protocol-http';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-browser';

import { RequestInit } from "openai/_shims/index"

/**
 * openAIモデルのインスタンス生成
 * @param pluginId
 * @param contractStatus 
 * @returns new ChatOpenAI
 */
export function openAIModel(pluginId: string, sessionId: string, contractStatus: ContractStatus) {
  if (contractStatus === ContractStatus.trial) {

    // トライアル契約
    return new ChatOpenAI({
      temperature: 0,
      modelKwargs: { "seed": 0 },
      modelName: kintone.plugin.app.getConfig(pluginId).targetModel,
      openAIApiKey: "dummy",
    }, {
      fetch: fetcherWrapper(pluginId, LlmType.openai, sessionId),
    });

  } else if (contractStatus === ContractStatus.active) {
    // 本契約
    return new ChatOpenAI({
      temperature: 0,
      modelKwargs: { "seed": 0 },
      modelName: "gpt-4-1106-preview",
      openAIApiKey: "dummy",  // proxyに任せるのでこの値は不要だが、LangChainの仕様上必須のためセットしている
    }, {
      baseURL: `${import.meta.env.VITE_AZURE_OPENAI_PROXY_ENDPOINT}/azure_openai_proxy/`,
      fetch: fetcherWrapper(pluginId, LlmType.azure, sessionId),
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
    "https://cybozu.dev/ja/kintone/docs/guideline/secure-coding-guideline/",
  ]
  const [
    codingGuidelineHtmlResponse,
    secureCodingGuidelineHtmlResponse
  ] = await Promise.all(urls.map(url => kintone.proxy(url, "GET", {}, {}))) as KintoneProxyResponse[];
  const [codingGuidelineResBody, codingGuidelineResStatus] = codingGuidelineHtmlResponse;
  const [secureCodingGuidelineResBody, secureCodingGuidelineResStatus] = secureCodingGuidelineHtmlResponse;
  if (codingGuidelineResStatus !== 200 || secureCodingGuidelineResStatus !== 200) {
    throw new GuidelineError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00008}）`)
  }
  const $1 = cheerio.load(codingGuidelineResBody);
  const $2 = cheerio.load(secureCodingGuidelineResBody);
  const codingGuideline = $1("article.main--content--article").text();
  const secureCodingGuideline = $2("article.main--content--article").text();
  return { codingGuideline, secureCodingGuideline }
}


/**
 * カスタムFetcherのWrapper
 *     pluginIdを渡すためWrapper
 * @param pluginId 
 * @param llmType
 * @param sessionId
 * @returns kintoneProxyFetcher
 */
const fetcherWrapper = (pluginId: string, llmType: LlmType, sessionId: string) => {

  /**
   * リクエストデータ設定
   * @param init 
   * @returns 
   */
  const fetcherSetting = (init: RequestInit) => {
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

    // kintone.plugin.app.proxyにオブジェクトで渡すため、init.bodyをオブジェクト型に変換
    const reqBody = JSON.parse(init?.body ? init.body.toString() : "{}");
    return { reqHeaders, reqBody }
  }

  /**
   * Langchainで使用されるfetchのカスタム(OpenAI用)
   *     kintone.plugin.app.proxyを使用してOpenAIにアクセス
   * @param url 
   * @param init 
   * @returns response
   */
  const kintoneProxyFetcherOpenAi: Fetch = async (url, init?) => {

    if (!init?.method) throw new Error(`OpenAIリクエストのmethodが指定されていません`)
    const { reqHeaders, reqBody } = fetcherSetting(init);

    // API連携
    const resProxy = await kintone.plugin.app.proxy(
      pluginId,
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

  /**
   * Langchainで使用されるfetchのカスタム(Azure用)
   *     kintone.plugin.app.proxyを使用してLambda azure-openai-proxyにアクセス
   * @param url 
   * @param init 
   * @returns response
   */
  const kintoneProxyFetcherAzure: Fetch = async (url, init?) => {

    if (!init?.method) throw new Error(`OpenAIリクエストのmethodが指定されていません`)
    const { reqHeaders, reqBody } = fetcherSetting(init);
    // 関数URL実行のためのクレデンシャル取得
    const credentials = await getAzureOpenAiProxyCredential(pluginId, sessionId);
    // 実行
    const resProxy = await azureOpenAiProxyRequest(credentials, url.toString(), reqHeaders, reqBody, pluginId);
    const [resBody, resStatus, resHeaders] = resProxy;

    // Fetchに合わせるため、Responseオブジェクトを設定
    const response = new Response(resBody, {
      status: resStatus,
      headers: resHeaders
    });
    return response;
  }

  if (llmType == LlmType.openai) {
    return kintoneProxyFetcherOpenAi;
  } else if (llmType === LlmType.azure) {
    return kintoneProxyFetcherAzure;
  }
}



interface Credentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
}
/**
 * Lambda関数URL実行のためのクレデンシャルを取得
 * @param pluginId 
 * @param sessionId 
 * @returns accessKeyId, secretAccessKey, sessionToken
 */
async function getAzureOpenAiProxyCredential(pluginId: string, sessionId: string): Promise<Credentials> {

  const [resBody, _resStatus, _resHeaders] = await kintone.plugin.app.proxy(
    pluginId,
    `${import.meta.env.VITE_AZURE_OPENAI_PROXY_CREDENTIAL_ENDPOINT}/azure_openai_proxy_credential`,
    'POST',
    {
      'Accept': 'application/json',
      'content-type': 'application/json',
    },
    {
      'sessionId': sessionId
    },
  ) as KintoneProxyResponse;
  const { AccessKeyId, SecretAccessKey, SessionToken } = JSON.parse(resBody) as AzureOpenAiProxyCredentialResponseBody;
  return {
    accessKeyId: AccessKeyId,
    secretAccessKey: SecretAccessKey,
    sessionToken: SessionToken
  }
}

/**
 * Lambda関数URL実行(Azure OpenAI Proxy)
 * @param credentials 
 * @param url 
 * @param reqHeaders 
 * @param reqBody 
 * @param pluginId 
 * @returns 
 */
async function azureOpenAiProxyRequest(credentials: Credentials, url: string, reqHeaders: any, reqBody: any, pluginId: string) {
  const signer = new SignatureV4({
    region: 'ap-northeast-1',
    service: 'lambda',
    sha256: Sha256,
    credentials,
  });

  const parsedUrl = new URL(url);
  const req = await signer.sign(
    new HttpRequest({
      method: 'POST',
      protocol: 'https:',
      path: '/chat/completions',
      hostname: parsedUrl.host,
      headers: {
        host: parsedUrl.host,
        ...reqHeaders
      },
      body: JSON.stringify(reqBody)
    })
  );

  return await kintone.plugin.app.proxy(
    pluginId,
    `${req.protocol}//${req.hostname}${req.path}`,
    req.method,
    req.headers,
    req.body,
  ) as KintoneProxyResponse;
}