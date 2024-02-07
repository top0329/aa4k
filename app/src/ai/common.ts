import { ChatOpenAI } from "@langchain/openai";
import { ContractStatus } from "~/constants";
import * as cheerio from "cheerio"

// カスタムエラーオブジェクト
export class ContractExpiredError extends Error { }

/**
 * openAIモデルのインスタンス生成
 * @param contractStatus 
 * @returns new ChatOpenAI
 */
export function openAIModel(contractStatus: ContractStatus) {
  if (contractStatus === ContractStatus.trial) {
    // プラグイン設定情報からAPIキーを取得
    // const openAiApiKey = kintone.plugin.app.getConfig(pluginId) // TODO: プラグイン開発としての準備が整っていないためコメントアウト
    const openAiApiKey = process.env.OPENAI_API_KEY;

    // トライアル契約
    return new ChatOpenAI({
      temperature: 0,
      modelKwargs: { "seed": 0 },
      openAIApiKey: openAiApiKey,
      modelName: "gpt-4-1106-preview",
    });

  } else if (contractStatus === ContractStatus.active) {
    // 本契約
    return new ChatOpenAI({
      temperature: 0,
      modelKwargs: { "seed": 0 },
      modelName: "gpt-4-1106-preview",
      azureOpenAIApiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
      azureOpenAIApiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION,
      azureOpenAIApiInstanceName: import.meta.env.VITE_AZURE_OPENAI_INSTANCE_NAME,
      azureOpenAIApiDeploymentName: import.meta.env.VITE_AZURE_OPENAI_GPT4_DEPLOYMENT_NAME,
      // modelName: "gpt-35-turbo-1106",
      // azureOpenAIApiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
      // azureOpenAIApiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION,
      // azureOpenAIApiInstanceName: import.meta.env.VITE_AZURE_OPENAI_INSTANCE_NAME,
      // azureOpenAIApiDeploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME,
      // }, {
      //   baseURL: `${import.meta.env.VITE_API_ENDPOINT}/xxxxxxx`  TODO: Azure OpenAIアクセス用プロキシのURLを設定
    });
  } else if (contractStatus === ContractStatus.expired) {
    throw new ContractExpiredError(`契約期間が終了しているためご利用できません`)
  } else {
    const unexpected: never = contractStatus;
    throw new Error(`契約区分が正しくありません (${unexpected})`)
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