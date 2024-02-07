import { ChatPromptTemplate } from "@langchain/core/prompts"
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { Document } from "@langchain/core/documents";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { AIMessage, BaseMessage, HumanMessage } from "langchain/schema"

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { APP_CREATE_JS_SYSTEM_PROMPT } from "./prompt"
import { addLineNumbersToCode, modifyCode } from "./util"
import { CodeTemplateRetriever } from "./retriever";
import { langchainCallbacks } from "../langchainCallbacks";
import { openAIModel, ContractExpiredError } from "../common"
import { DeviceDiv } from "~/constants"
import { AiResponse, Conversation, MessageType, CodeCreateMethod, AppCreateJsContext, kintoneFormFields } from "../../types/ai";
import { GeneratedCodeGetResponseBody } from "~/types/apiResponse";
import { getKintoneCustomizeJs, updateKintoneCustomizeJs } from "../../util/kintoneCustomize"

import * as prettier from "prettier/standalone"
import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";

// カスタムエラーオブジェクト
export class LlmError extends Error { }

/**
 * kintoneカスタマイズJavascript生成
 * @param conversation 
 * @returns AiResponse
 */
export const appCreateJs = async (conversation: Conversation): Promise<AiResponse> => {
  const callbackFuncs: Function[] = [];
  const appCreateJsContext = conversation.context as AppCreateJsContext;
  const { appId, userId, conversationId, deviceDiv, isGuestSpace } = appCreateJsContext;
  try {
    // --------------------
    // コード生成に必要なリソースの取得
    // --------------------
    const { isLatestCode,
      fieldInfo,
      codingGuidelineList,
      codeTemplate,
      kintoneCustomizeFiles,
      targetFileKey,
      originalCode
    } = await preGetResource(conversation);

    // --------------------
    // コード生成
    // --------------------
    const { llmResponse, formattedCode } = await createJs(conversation, fieldInfo, isLatestCode, codingGuidelineList, codeTemplate, originalCode);

    // --------------------
    // kintoneカスタマイズへの反映
    // --------------------
    await updateKintoneCustomizeJs(formattedCode, targetFileKey, kintoneCustomizeFiles, appId, deviceDiv, isGuestSpace);

    // --------------------
    // レスポンス設定
    // --------------------
    let message = `${llmResponse.resultMessage}`;
    let messageComment = `${llmResponse.autoComplete ? `■自動補完説明\n${llmResponse.autoComplete}` : ""}`;
    messageComment += `${llmResponse.correctionInstructions ? `\n■修正指示例\n${llmResponse.correctionInstructions}` : ""}`;
    messageComment += `${llmResponse.guideMessage ? `\n■ガイドライン違反\n${llmResponse.guideMessage}` : ""}`;

    // --------------------
    // 回答メッセージと生成したコードの登録 (会話履歴TBL)
    // --------------------
    insertConversation(appId, userId, deviceDiv, MessageType.ai, message, conversationId, messageComment, formattedCode)

    // --------------------
    // コールバック関数設定(コード生成後の動作)
    // --------------------
    const redirectPath = `/k/admin/preview/${appId}/`;
    const currentUrl = location.href;
    if (currentUrl.includes(redirectPath)) {
      // プレビュー画面の場合
      callbackFuncs.push(() => { (location.href = redirectPath) });
    } else {
      // 本番画面の場合
      callbackFuncs.push(() => {
        if (window.confirm("テスト環境で動作確認を行いますか？「OK」を選択するとテスト環境へ画面遷移します。")) {
          (location.href = redirectPath)
        }
      });
    }

    // 終了
    return {
      message: {
        role: "ai",
        content: message,
        comment: messageComment
      },
      callbacks: callbackFuncs,
    };

  } catch (err) {
    if (err instanceof LlmError || err instanceof ContractExpiredError) {
      const message = err.message;
      insertConversation(appId, userId, deviceDiv, MessageType.error, message, conversationId)
      return { message: { role: MessageType.error, content: message, } }
    } else {
      const message = "システムエラーが発生しました";
      insertConversation(appId, userId, deviceDiv, MessageType.error, message, conversationId)
      return { message: { role: MessageType.error, content: message } }
    }
  }
}



/**
 * コード生成に必要なリソースの取得
 * @param conversation 
 * @returns isLatestCode, fieldInfo, codingGuidelineList[], codeTemplate, kintoneCustomizeFiles, targetFileKey, originalCode
 */
async function preGetResource(conversation: Conversation) {
  const { message } = conversation;
  const appCreateJsContext = conversation.context as AppCreateJsContext;
  const { appId, userId, deviceDiv, isGuestSpace, systemSettings } = appCreateJsContext;

  // --------------------
  // フィールド情報の取得
  // --------------------
  const getField_res = await kintone.api(
    kintone.api.url("/k/v1/app/form/fields", isGuestSpace),
    "GET", { app: appId },
  ) as kintoneFormFields;
  const fieldInfo = getField_res.properties;

  // --------------------
  // コードテンプレートの取得
  // --------------------
  const codeTemplateRetriever = new CodeTemplateRetriever(systemSettings.retrieveMaxCount, systemSettings.retrieveScoreThreshold);
  const codeTemplate = await codeTemplateRetriever.getRelevantDocuments(message.content);

  // --------------------
  // ガイドライン取得
  // --------------------
  const { codingGuideline, secureCodingGuideline } = await getCodingGuidelines();

  // --------------------
  // 最新JSの取得（from kintone）
  // --------------------
  const { kintoneCustomizeFiles, targetFileKey, jsCodeForKintone } = await getKintoneCustomizeJs(appId, deviceDiv, isGuestSpace)


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
  const resJson_jsCodeForDb = JSON.parse(res_jsCodeForDb[0]) as GeneratedCodeGetResponseBody;
  const jsCodeForDb = resJson_jsCodeForDb.javascriptCode;

  // 最新コード比較
  const isLatestCode = jsCodeForKintone === jsCodeForDb

  // 結果返却
  return {
    isLatestCode,
    fieldInfo,
    codingGuidelineList: [codingGuideline, secureCodingGuideline],
    codeTemplate,
    kintoneCustomizeFiles,
    targetFileKey,
    originalCode: jsCodeForKintone
  }
}


/**
 * コード生成
 * @param conversation 
 * @param fieldInfo 
 * @param isLatestCode 
 * @param codingGuidelineList 
 * @param codeTemplate 
 * @param originalCode 
 * @returns llmResponse, formattedCode
 */
async function createJs(
  conversation: Conversation,
  fieldInfo: Record<string, any>,
  isLatestCode: boolean,
  codingGuidelineList: string[],
  codeTemplate: Document[],
  originalCode: string,
) {
  const { message, chatHistory = [] } = conversation; // デフォルト値としてchatHistory = []を設定
  const appCreateJsContext = conversation.context as AppCreateJsContext;
  const { contractStatus, systemSettings } = appCreateJsContext;
  const codingGuideLine = codingGuideLineList[0];
  const secureCodingGuideline = codingGuideLineList[1];

  // 会話履歴の設定（DBから取得したコードが最新でなければ履歴なし扱い）
  const histories: BaseMessage[] = [];
  if (isLatestCode) {
    // 直近 N個の 会話履歴を使用する
    const historyUseCount = systemSettings.historyUseCount;
    chatHistory.slice((-1) * historyUseCount).forEach(history => {
      // AI回答がある場合、会話履歴に追加
      if (history.human.role === "human" && (history.ai && history.ai.role === "ai")) {
        histories.push(new HumanMessage(history.human.content));
        histories.push(new AIMessage(history.ai.content));
      }
    });
  }
  // 生成（LLM実行）
  const handler = BaseCallbackHandler.fromMethods({ ...langchainCallbacks });
  const model = openAIModel(contractStatus);
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", APP_CREATE_JS_SYSTEM_PROMPT],
    ...histories,
    ["human", message.content],
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
        method: z.nativeEnum(CodeCreateMethod).describe("メソッド"),
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
    codingGuideline: codingGuideline,
    secureCodingGuideline: secureCodingGuideline,
    fieldInfo: JSON.stringify(fieldInfo),
    originalCode: addLineNumbersToCode(originalCode),
    codeTemplate: codeTemplate,
  }, { callbacks: [handler] }).catch(() => { throw new LlmError("kintoneカスタマイズJavascriptの生成に失敗しました") })) as LLMResponse;

  // 出力コード編集
  const resProperties = llmResponse.properties;
  let editedCode = originalCode;
  resProperties.forEach((obj) => {
    const method = obj.method;
    if (method === CodeCreateMethod.create) {
      editedCode = obj.javascriptCode;
    } else {
      editedCode = modifyCode(editedCode, obj.startAt, obj.endAt, obj.linesCount, obj.javascriptCode);
    }
  })
  const formattedCode = await prettier.format(editedCode, { parser: "babel", plugins: [parserBabel, prettierPluginEstree] });

  // 結果返却
  return {
    llmResponse,
    formattedCode
  };
}


/**
 * 会話履歴の登録
 * @param appId 
 * @param userId 
 * @param deviceDiv 
 * @param message 
 * @param conversationId 
 * @param code 
 */
function insertConversation(appId: number, userId: string, deviceDiv: DeviceDiv, messageType: MessageType, message: string, conversationId: string, messageComment?: string,javascriptCode?: string) {
  const body = messageType == MessageType.ai ?
    { appId, userId, deviceDiv, messageType, message, conversationId, messageComment, javascriptCode } :
    { appId, userId, deviceDiv, messageType, message, conversationId }
  // TODO: 「kintone.plugin.app.proxy」でAPI連携する必要がある（プラグイン開発としての準備が整っていないため暫定的に「kintone.proxy」を使用
  kintone.proxy(
    `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/insert`,
    "POST",
    { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
    body,
  );
}