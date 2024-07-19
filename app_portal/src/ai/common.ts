import { z, ZodTypeAny, ZodObject, ZodRawShape } from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { BaseMessage } from "langchain/schema"

import { LangchainLogsInsertCallbackHandler } from "./langchainLogsInsertCallbackHandler";
import { LlmType, ContractStatus, ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants";
import { PromptInfo, PromptFunctionParameter } from "~/types"
import { KintoneProxyResponse, AzureOpenAiProxyCredentialResponseBody } from "~/types/apiInterfaces"
import { getSubDomain } from '~/util/getSubDomain';
import { ContractExpiredError, ContractStatusError, ApiError } from "~/util/customErrors"
import { LlmError } from "~/util/customErrors"
import { getPromptInfoList } from "~/util/getPrompt"
import { getApiErrorMessageForAI } from "~/util/getErrorMessage";

import { Fetch } from "openai/core"
import { HttpRequest } from '@aws-sdk/protocol-http';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-browser';

import { RequestInit } from "openai/_shims/index"



/**
 * openAIモデルのインスタンス生成
 * @param contractStatus 
 * @returns new ChatOpenAI
 */
export function openAIModel(sessionId: string, contractStatus: ContractStatus) {
  if (contractStatus === ContractStatus.trial) {

    // トライアル契約
    return new ChatOpenAI({
      temperature: 0,
      modelKwargs: { "seed": 0 },
      // modelName: kintone.plugin.app.getConfig(pluginId).targetModel,
      modelName: "gpt-4o",
      openAIApiKey: "dummy",
    }, {
      fetch: fetcherWrapper(LlmType.openai, sessionId),
    });

  } else if (contractStatus === ContractStatus.active) {
    // 本契約
    return new ChatOpenAI({
      temperature: 0,
      modelKwargs: { "seed": 0 },
      modelName: "gpt-4-1106-preview",
      openAIApiKey: "dummy",  // proxyに任せるのでこの値は不要だが、LangChainの仕様上必須のためセットしている
    }, {
      baseURL: `${import.meta.env.VITE_AZURE_OPENAI_PROXY_ENDPOINT}`,
      fetch: fetcherWrapper(LlmType.azure, sessionId),
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
 * カスタムFetcherのWrapper
 * @param llmType
 * @param sessionId
 * @returns kintoneProxyFetcher
 */
const fetcherWrapper = (llmType: LlmType, sessionId: string) => {

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
    const credentials = await getAzureOpenAiProxyCredential(sessionId);
    // 実行
    const resProxy = await azureOpenAiProxyRequest(credentials, url.toString(), reqHeaders, reqBody);
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
 * @param sessionId 
 * @returns accessKeyId, secretAccessKey, sessionToken
 */
async function getAzureOpenAiProxyCredential(sessionId: string): Promise<Credentials> {

  const [resBody, _resStatus, _resHeaders] = await kintone.proxy(
    `${import.meta.env.VITE_AZURE_OPENAI_PROXY_CREDENTIAL_ENDPOINT}/portal/azure_openai_proxy_credential`,
    'POST',
    {
      'Accept': 'application/json',
      'content-type': 'application/json',
      'aa4k-subdomain': getSubDomain(),
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
async function azureOpenAiProxyRequest(credentials: Credentials, url: string, reqHeaders: any, reqBody: any) {
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
        // 'aa4k-subdomain': getSubDomain(),
        // 'aa4k-subscription-id': 'aa4k',
        ...reqHeaders
      },
      body: JSON.stringify(reqBody)
    })
  );

  return await kintone.proxy(
    `${req.protocol}//${req.hostname}${req.path}`,
    req.method,
    req.headers,
    req.body,
  ) as KintoneProxyResponse;
}





/**
 * LLM連携用のzodスキーマの生成
 * @param inputData 
 * @param parentDescribe 
 * @returns 
 */
export function createZodSchema(inputData: PromptInfo, parentDescribe: string): ZodObject<ZodRawShape> {
  // 型マッピング
  const typeMapping: { [key: string]: (...args: any[]) => ZodTypeAny } = {
    string: () => z.string(),
    number: () => z.number(),
    object: (children: ZodRawShape) => z.object(children),
    array: (itemType: ZodTypeAny) => z.array(itemType),
    nativeEnum: (constants: string[]) => z.enum(constants as [string, ...string[]]),
  };

  // 入力データの解析
  const parseParameters = (params: PromptFunctionParameter[], parentId: number | null = null): ZodRawShape => {
    return params
      .filter(param => param.parent_item_id === parentId)
      .reduce((acc, param) => {
        const { item_name, item_type, item_describe, item_id, constants } = param;
        const children = parseParameters(params, item_id);

        let schema: ZodTypeAny;
        if (item_type === 'object') {
          // object型の場合
          schema = typeMapping[item_type](children).describe(item_describe);
        } else if (item_type === 'array') {
          // array型の場合
          const arrayItemType = params.find(p => p.parent_item_id === item_id);
          if (arrayItemType) {
            const arrayItemSchema = arrayItemType.item_type === 'object'
              ? typeMapping[arrayItemType.item_type](parseParameters(params, arrayItemType.item_id)).describe(arrayItemType.item_describe)
              : typeMapping[arrayItemType.item_type]().describe(arrayItemType.item_describe);
            schema = typeMapping[item_type](arrayItemSchema).describe(item_describe);
          } else {
            throw new Error(`Array item type not found for item_id: ${item_id}`);
          }
        } else if (item_type === 'nativeEnum') {
          // nativeEnum型の場合
          const constantsArray = constants.split(',');
          schema = typeMapping[item_type](constantsArray).describe(item_describe);
        } else {
          // 上記以外の型の場合
          schema = typeMapping[item_type]().describe(item_describe);
        }
        acc[item_name] = schema;
        return acc;
      }, {} as ZodRawShape);
  };

  // Zodスキーマの生成
  const zodSchema = z.object(parseParameters(inputData.prompt_function_parameter)).describe(parentDescribe);

  return zodSchema;
}


/**
 * プロンプト情報の設定
 * @param targetDivList 
 * @param promptInfoList 
 * @returns promptInfo
 */
export async function setPrompt(targetDivList: string[], promptInfoList?: PromptInfo[]) {

  let latestPromptInfoList = promptInfoList;
  if (!latestPromptInfoList || latestPromptInfoList.length === 0) {
    // プロンプト情報が取得できていない場合は取得
    const { promptResult, resStatus: resPromptStatus } = await getPromptInfoList();
    if (resPromptStatus !== 200) {
      const errorMessage = getApiErrorMessageForAI(resPromptStatus, promptResult.errorCode)
      throw new ApiError(errorMessage)
    }
    latestPromptInfoList = promptResult.promptInfoList;
  }
  const promptInfo = latestPromptInfoList.filter(info => targetDivList.includes(info.service_div));
  if (!promptInfo) {
    throw new LlmError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00013}）`);
  }
  return promptInfo;
}



interface ExecuteLlmContext {
  userId: string;
  conversationId: string;
  sessionId: string;
}
interface PromptParam {
  [key: string]: string;
}
/**
 * LLM実行
 * @param message 
 * @param histories 
 * @param contractStatus 
 * @param promptInfo 
 * @param promptParam 
 * @param context 
 * @returns llmResponse
 */
export async function executeLlm(message: string, histories: BaseMessage[], contractStatus: ContractStatus, promptInfo: PromptInfo, promptParam: PromptParam, context: ExecuteLlmContext,) {

  const handler = new LangchainLogsInsertCallbackHandler({ sessionId: context.sessionId, userId: context.userId, conversationId: context.conversationId });
  const model = openAIModel(context.sessionId, contractStatus);
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", promptInfo.prompt],
    ...histories,
    ["human", message],
  ]);

  // LLMの出力形式を設定
  const zodSchema = createZodSchema(promptInfo, "LLM問い合わせ結果");

  type LLMResponse = z.infer<typeof zodSchema>;
  const functionCallingModel = model.bind({
    functions: [
      {
        name: "output_formatter",
        description: "Should always be used to properly format output",
        parameters: zodToJsonSchema(zodSchema),
      },
    ],
    function_call: { name: "output_formatter" },
  });
  const outputParser = new JsonOutputFunctionsParser();
  const chain = prompt.pipe(functionCallingModel).pipe(outputParser);
  const llmResponse = (await chain.invoke(promptParam, { callbacks: [handler] }).catch((err) => {
    if (err.code === "invalid_api_key") {
      throw new LlmError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00009}）`)
    } else if (err.code === "429") {
      // レート制限に引っかかった場合、エラーを出力
      throw new LlmError(`${ErrorMessageConst.E_MSG007}（${ErrorCode.E00011}）`)
    } else {
      throw new LlmError(`${ErrorMessageConst.E_MSG009}（${ErrorCode.E00004}）`)
    }
  })) as LLMResponse;

  return llmResponse;
}