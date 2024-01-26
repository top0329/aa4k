import { ChatOpenAI } from "@langchain/openai";

type ContractDiv = "trial" | "active" | "expired";

/**
 * openAIモデルのインスタンス生成
 * @param contractDiv 
 * @returns new ChatOpenAI
 */
export function openAIModel(contractDiv: ContractDiv) {
  if (contractDiv === "trial") {
    // プラグイン設定情報からAPIキーを取得
    // const openAiApiKey = kintone.plugin.app.getConfig(pluginId) // TODO: プラグイン開発としての準備が整っていないためコメントアウト
    const openAiApiKey = process.env.OPENAI_API_KEY;

    // トライアル契約
    return new ChatOpenAI({
      temperature: 0,
      openAIApiKey: openAiApiKey,
      modelName: "gpt-4-1106-preview",
    });

  } else if (contractDiv === "active") {
    // 本契約
    return new ChatOpenAI({
      temperature: 0,
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
  } else if (contractDiv === "expired") {
    throw `契約期間外です。 ${contractDiv}`
  } else {
    const unexpected: never = contractDiv;
    throw `契約区分が正しくありません。 ${unexpected}`
  }

};