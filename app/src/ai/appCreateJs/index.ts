import { ChatPromptTemplate } from "@langchain/core/prompts"
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "langchain/schema"

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as cheerio from "cheerio"

import { APP_CREATE_JS_SYSTEM_PROMPT } from "./prompt"
import { addLineNumbersToText, modifyCode } from "./util"
import { langchainCallbacks } from "../langchainCallbacks";
import { CodeTemplateRetriever } from "./retriever";
import { openAIModel } from "../common"
import { AiResponse, Conversation } from "../../types/ai";
import { getKintoneCustomizeJs, updateKintoneCustomizeJs } from "../../util/kintoneCustomize"

import * as prettier from "prettier/standalone"
import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";

/**
 * kintoneカスタマイズJavascript生成
 * @param conversation 
 * @returns AiResponse
 */
export const appCreateJs = async (conversation: Conversation): Promise<AiResponse> => {
  const callbackFuncs: Function[] = [];
  try {
    const message = conversation.message.content;
    const chatHistory = conversation.chatHistory || []; // 会話履歴
    const appId = conversation.context?.appId;  // アプリID
    const userId = conversation.context?.userId;  // ユーザID
    const conversationId = conversation.context?.conversationId;  // 会話ID
    const deviceDiv = conversation.context?.deviceDiv;  // デスクトップ or モバイル
    const contractDiv = conversation.context?.contractDiv;  // 本契約 or トライアル

    // ******************************
    // フィールド情報の取得
    // ******************************
    const getField_res = await kintone.api(
      kintone.api.url("/k/v1/app/form/fields", false),
      "GET", { app: appId },
    );
    const fieldInfo = getField_res["properties"];

    // --------------------
    // コードテンプレートの取得
    // --------------------
    const codeTemplateRetriever = new CodeTemplateRetriever();
    const codeTemplate = await codeTemplateRetriever.getRelevantDocuments(message);

    // --------------------
    // ガイドライン取得
    // --------------------
    const urls = [
      "https://cybozu.dev/ja/kintone/docs/guideline/coding-guideline/",
      "https://cybozu.dev/ja/kintone/docs/guideline/secure-coding-guideline/"
    ]
    const [codingGuideLineHtml, secureCodingGuidelineHtml] = await Promise.all(urls.map(url => kintone.proxy(url, "GET", {}, {})));
    const $1 = cheerio.load(codingGuideLineHtml[0]);
    const $2 = cheerio.load(secureCodingGuidelineHtml[0]);
    const codingGuideLine = $1("article.main--content--article").text();
    const secureCodingGuideline = $2("article.main--content--article").text();

    // --------------------
    // 最新JSの取得（from kintone）
    // --------------------
    const { kintoneCustomizeFiles, targetFileKey, jsCodeForKintone } = await getKintoneCustomizeJs(appId, deviceDiv)


    // --------------------
    // 最新JSの取得（from DB）
    // --------------------
    // TODO: 「kintone.plugin.app.proxy」でAPI連携する必要がある（プラグイン開発としての準備が整っていないため暫定的に「kintone.proxy」を使用
    const res_jsCodeForDb = await kintone.proxy(
      `${import.meta.env.VITE_API_ENDPOINT}/generated_code/get-code`,
      "POST",
      { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
      { appId: appId, userId: userId, deviceDiv: deviceDiv, },
    );
    const resJson_jsCodeForDb = JSON.parse(res_jsCodeForDb[0]);
    const jsCodeForDb = resJson_jsCodeForDb.javascriptCode;

    // --------------------
    // コード生成
    // --------------------
    // 最新コード比較
    const isLatest = (jsCodeForKintone === jsCodeForDb) ? true : false;

    // 会話履歴の設定（DBから取得したコードが最新でなければ履歴なし扱い）
    const histories: BaseMessage[] = [];
    if (isLatest) {
      // 直近10個の会話履歴を使用する
      chatHistory.slice(-10).forEach(history => {
        if (history.role === "human") {
          histories.push(new HumanMessage(history.content));
        } else if (history.role === "ai") {
          histories.push(new AIMessage(history.content));
        } else if (history.role === "system") {
          histories.push(new SystemMessage(history.content));
        }
      });
    }

    // 生成（LLM実行）
    const handler = BaseCallbackHandler.fromMethods({ ...langchainCallbacks });
    const model = openAIModel(contractDiv);
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", APP_CREATE_JS_SYSTEM_PROMPT],
      ...histories,
      ["human", message],
    ]);

    // LLMの出力形式を設定
    const zodSchema = z.object({
      resultMessage: z.string().describe("質問に対する結果メッセージ"),
      autoComplete: z.string().describe("自動補完説明"),
      correctionInstructions: z.string().describe("修正指示"),
      violationOfGuidelines: z.string().describe("オリジナルコードのガイドライン違反"),
      guideMessage: z.string().describe("ガイドライン違反のためユーザーの要望に答えられなかった内容（無ければブランク）"),
      properties: z.array(
        z.object({
          method: z.string().describe("メソッド"),
          startAt: z.number().describe("開始位置"),
          endAt: z.number().describe("終了位置"),
          linesCount: z.number().describe("行数"),
          javascriptCode: z.string().describe("ソースコード"),
        }).describe("ユーザーの要望に応じて作成した結果"),
      )
    }).describe("LLM問い合わせ結果");
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
    const llmResponse = (await chain.invoke({
      codingGuideLine: codingGuideLine,
      secureCodingGuideline: secureCodingGuideline,
      fieldInfo: JSON.stringify(fieldInfo),
      originalCode: addLineNumbersToText(jsCodeForKintone),
      codeTemplate: codeTemplate,
    }, { callbacks: [handler] })) as LLMResponse;

    // 出力コード編集
    const resultMessage = llmResponse.resultMessage;
    const resProperties = llmResponse.properties;
    let editedCode = jsCodeForKintone;
    resProperties.forEach((obj) => {
      const method = obj.method;
      if (method === "CREATE") {
        editedCode = obj.javascriptCode;
      } else {
        editedCode = modifyCode(editedCode, obj.startAt, obj.endAt, obj.linesCount, obj.javascriptCode);
      }
    })
    const formattedCode = await prettier.format(editedCode, { parser: "babel", plugins: [parserBabel, prettierPluginEstree] });

    // --------------------
    // kintoneカスタマイズへの反映
    // --------------------
    await updateKintoneCustomizeJs(formattedCode, targetFileKey, kintoneCustomizeFiles, appId, deviceDiv);

    // --------------------
    // レスポンス設定
    // --------------------
    let response = `${resultMessage}`
    response += `${llmResponse.autoComplete ? `\n\n■自動補完説明\n${llmResponse.autoComplete}` : ""}`
    response += `${llmResponse.correctionInstructions ? `\n■修正指示例\n${llmResponse.correctionInstructions}` : ""}`
    response += `${llmResponse.guideMessage ? `\n■ガイドライン違反\n${llmResponse.guideMessage}` : ""}`

    // --------------------
    // 回答メッセージと生成したコードの登録（会話履歴TBL）
    // --------------------
    // TODO: 「kintone.plugin.app.proxy」でAPI連携する必要がある（プラグイン開発としての準備が整っていないため暫定的に「kintone.proxy」を使用
    await kintone.proxy(
      `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/insert`,
      "POST",
      { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
      { appId: appId, userId: userId, deviceDiv: deviceDiv, messageDiv: "ai", message: response, conversationId: conversationId, javascriptCode: formattedCode },
    );

    callbackFuncs.push(() => (window.open(`/k/admin/preview/${appId}/`, '_blank')));

    // 終了
    return {
      message: {
        role: "ai",
        content: response,
      },
      callbacks: callbackFuncs,
    };

  } catch (err) {
    console.log("AI機能-kintoneカスタマイズJavascript生成に失敗しました。")
    console.log(err)
    throw err
  }
}
