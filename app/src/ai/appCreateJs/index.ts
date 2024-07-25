import { ChatPromptTemplate } from "@langchain/core/prompts"
import { Document } from "@langchain/core/documents";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { AIMessage, BaseMessage, HumanMessage } from "langchain/schema"

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { v4 as uuidv4 } from 'uuid';

import { addLineNumbersToCode, modifyCode, removeIncompleteJSDoc } from "./util"
import { CodeTemplateRetriever } from "./retriever";
import { LangchainLogsInsertCallbackHandler } from "../langchainLogsInsertCallbackHandler";
import { openAIModel, getCodingGuidelines, createZodSchema } from "../common"
import { DeviceDiv, CodeCreateMethodCreate, CodeCreateMethodEdit, ErrorCode, InfoMessage, ErrorMessage as ErrorMessageConst, ServiceDiv } from "~/constants"
import { AiResponse, Conversation, MessageType, AppCreateJsContext, kintoneFormFields } from "../../types/ai";
import { GeneratedCodeGetResponseBody, KintoneProxyResponse, KintoneRestAPiError } from "~/types/apiResponse";
import { getKintoneCustomizeJs, updateKintoneCustomizeJs } from "../../util/kintoneCustomize"
import { getApiErrorMessageForCreateJs } from "~/util/getErrorMessage"
import { getPromptInfoList } from "~/util/getPrompt"

import { LlmError, KintoneError, ApiError, GuidelineError, RetrieveError, ContractExpiredError, ContractStatusError } from "~/util/customErrors"

import * as prettier from "prettier/standalone"
import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";

/**
 * kintoneカスタマイズJavascript生成
 * @param conversation 
 * @param isChangeCode 
 * @param setIsReload 
 * @param isChangeCodeRef 
 * @returns AiResponse
 */
export const appCreateJs = async (
  conversation: Conversation,
  isChangeCode: boolean,
  setIsReload: React.Dispatch<React.SetStateAction<boolean>>,
  isChangeCodeRef?: React.MutableRefObject<boolean>,
): Promise<AiResponse> => {
  const callbackFuncs: Function[] = [];
  const appCreateJsContext = conversation.context as AppCreateJsContext;
  const { appId, userId, conversationId, deviceDiv, isGuestSpace, pluginId } = appCreateJsContext;
  const sessionId = uuidv4();
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
    } = await preGetResource(conversation, sessionId);

    // --------------------
    // コード生成
    // --------------------
    const { llmResponse, formattedCode, isCreateJs } = await createJs(conversation, fieldInfo, isLatestCode, codingGuidelineList, codeTemplate, originalCode, sessionId);

    // --------------------
    // レスポンス設定
    // --------------------
    const message = `${llmResponse.resultMessage}`;
    const comment = llmResponse.supplement && llmResponse.supplement.contentsOfCreatedJs ? `補足：\n${llmResponse.supplement.contentsOfCreatedJs}\n\n` : '';
    const exampleOfChange = llmResponse.supplement && llmResponse.supplement.instructionsToChange ? `変更例：\n${llmResponse.supplement.instructionsToChange}\n\n` : '';
    const guideMessage = llmResponse.supplement && llmResponse.guideMessage ? `ガイドライン違反：\n${llmResponse.guideMessage}\n` : '';

    // テンプレートリテラルを使用して、最終的なメッセージを組み立てる。
    const messageComment = `${comment}${exampleOfChange}${guideMessage}`.trim();

    // --------------------
    // 回答メッセージと生成したコードの登録 (会話履歴TBL)
    // --------------------
    insertConversation(pluginId, appId, userId, deviceDiv, MessageType.ai, message, conversationId, messageComment, formattedCode)

    // JS生成された場合のみ、kintoneへの反映と、コールバック関数の設定を行う
    if (isCreateJs) {
      // --------------------
      // kintoneカスタマイズへの反映
      // --------------------
      await updateKintoneCustomizeJs(formattedCode, targetFileKey, kintoneCustomizeFiles, appId, deviceDiv, isGuestSpace);

      // --------------------
      // コールバック関数設定(コード生成後の動作)
      // --------------------
      // 本番画面の場合
      callbackFuncs.push(createProdEnvCallbackFunc({
        // redirectPath,
        isChangeCode,
        isChangeCodeRef,
        setIsReload,
      }));
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
    if (err instanceof LlmError
      || err instanceof KintoneError
      || err instanceof ApiError
      || err instanceof GuidelineError
      || err instanceof RetrieveError
      || err instanceof ContractExpiredError
      || err instanceof ContractStatusError
    ) {
      const message = err.message;
      insertConversation(pluginId, appId, userId, deviceDiv, MessageType.error, message, conversationId)
      return { message: { role: MessageType.error, content: message, } }
    } else {
      const message = `${ErrorMessageConst.E_MSG008}（${ErrorCode.E99999}）`;
      insertConversation(pluginId, appId, userId, deviceDiv, MessageType.error, message, conversationId)
      return { message: { role: MessageType.error, content: message } }
    }
  }
}

type CreateCallbackFuncProps = {
  isChangeCode: boolean;
  isChangeCodeRef?: React.MutableRefObject<boolean>;
  setIsReload: React.Dispatch<React.SetStateAction<boolean>>;
}


/**
 * 本番画面の場合のコールバック関数を作成
 * @param isChangeCode 
 * @param isChangeCodeRef 
 * @param setIsReload 
 */
const createProdEnvCallbackFunc = ({ isChangeCode, isChangeCodeRef, setIsReload }: CreateCallbackFuncProps) => {
  const prodEnvCallbackFunc = () => {
    if (isChangeCode) {
      // コードエディタのコードが編集されていたら、確認モーダルを表示
      if (window.confirm(`${InfoMessage.I_MSG001}`)) {
        if (isChangeCodeRef) {
          isChangeCodeRef.current = false;
        }
        setIsReload(true);
        // 画面再読み込み
        (location.reload())
      }
    } else {
      setIsReload(true);
      (location.reload())
    }
  }

  return prodEnvCallbackFunc;
}



/**
 * コード生成に必要なリソースの取得
 * @param conversation 
 * @param sessionId
 * @returns isLatestCode, fieldInfo, codingGuidelineList[], codeTemplate, kintoneCustomizeFiles, targetFileKey, originalCode
 */
async function preGetResource(conversation: Conversation, sessionId: string) {
  const { message } = conversation;
  const appCreateJsContext = conversation.context as AppCreateJsContext;
  const { appId, userId, conversationId, deviceDiv, isGuestSpace, pluginId } = appCreateJsContext;

  // --------------------
  // フィールド情報の取得
  // --------------------
  const getField_res = await kintone.api(
    kintone.api.url("/k/v1/app/form/fields", isGuestSpace),
    "GET", { app: appId },
  ).catch((e: KintoneRestAPiError) => {
    throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`)
  }) as kintoneFormFields;

  const fieldInfo = getField_res.properties;

  // --------------------
  // コードテンプレートの取得
  // --------------------
  const codeTemplateRetriever = new CodeTemplateRetriever({
    LangchainLogsInsertProps: { pluginId, sessionId, appId, userId, conversationId },
    pluginId,
    conversationId
  }
  );
  const codeTemplate = await codeTemplateRetriever.invoke(message.content);

  // --------------------
  // ガイドライン取得
  // --------------------
  const { codingGuideline, secureCodingGuideline } = await getCodingGuidelines();

  // --------------------
  // 最新JSの取得（from kintone）
  // --------------------
  const { kintoneCustomizeFiles, targetFileKey, jsCodeForKintone } = await getKintoneCustomizeJs(appId, deviceDiv, isGuestSpace);


  // --------------------
  // 最新JSの取得（from DB）
  // --------------------
  const res_jsCodeForDb = await kintone.plugin.app.proxy(
    pluginId,
    `${import.meta.env.VITE_API_ENDPOINT}/plugin/com/generated_code/get-code`,
    "POST",
    {},
    { appId: appId, userId: userId, deviceDiv: deviceDiv, conversationId: conversationId },
  ) as KintoneProxyResponse;
  const [res_jsCodeForDbBody, res_jsCodeForDbStatus] = res_jsCodeForDb;
  const resJson_jsCodeForDb = JSON.parse(res_jsCodeForDbBody) as GeneratedCodeGetResponseBody;
  if (res_jsCodeForDbStatus !== 200) {
    const errorMessage = getApiErrorMessageForCreateJs(res_jsCodeForDbStatus, resJson_jsCodeForDb.errorCode)
    throw new ApiError(errorMessage)
  }

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
  sessionId: string,
) {
  const { message, chatHistory = [] } = conversation; // デフォルト値としてchatHistory = []を設定
  const appCreateJsContext = conversation.context as AppCreateJsContext;
  const { appId, userId, conversationId, deviceDiv, contractStatus, systemSettings, pluginId, promptInfoList } = appCreateJsContext;
  const codingGuideline = codingGuidelineList[0];
  const secureCodingGuideline = codingGuidelineList[1];

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

  // --------------------
  // プロンプト情報の確認
  // --------------------
  let latestPromptInfoList = promptInfoList;
  if (!latestPromptInfoList || latestPromptInfoList.length === 0) {
    // プロンプト情報が取得できていない場合は取得
    const { promptResult, resStatus: resPromptStatus } = await getPromptInfoList(pluginId);
    if (resPromptStatus !== 200) {
      const errorMessage = getApiErrorMessageForCreateJs(resPromptStatus, promptResult.errorCode)
      throw new ApiError(errorMessage)
    }
    latestPromptInfoList = promptResult.promptInfoList;
  }
  const jsCreatePromptInfo = latestPromptInfoList.find(info => info.service_div === ServiceDiv.jsCreate);
  if (!jsCreatePromptInfo) {
    throw new LlmError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00013}）`);
  }

  // 生成（LLM実行）
  const handler = new LangchainLogsInsertCallbackHandler({ pluginId, sessionId, appId, userId, conversationId });
  const model = openAIModel(pluginId, sessionId, contractStatus);
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", jsCreatePromptInfo.prompt],
    ...histories,
    ["human", message.content],
  ]);

  // LLMの出力形式を設定
  const zodSchema = createZodSchema(jsCreatePromptInfo, "LLM問い合わせ結果");

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
    codeTemplate: codeTemplate.map((template) => template.pageContent),
    deviceDiv: deviceDiv,
  }, { callbacks: [handler] }).catch((err) => {
    if (err.code === "invalid_api_key") {
      throw new LlmError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00009}）`)
    } else if (err.code === "429") {
      // レート制限に引っかかった場合、エラーを出力
      throw new LlmError(`${ErrorMessageConst.E_MSG007}（${ErrorCode.E00011}）`)
    } else {
      throw new LlmError(`${ErrorMessageConst.E_MSG009}（${ErrorCode.E00004}）`)
    }
  })) as LLMResponse;

  // JS生成された場合
  let isCreateJs = false;
  if (llmResponse.properties &&
    (
      llmResponse.properties.method === CodeCreateMethodEdit.delete || llmResponse.properties.javascriptCode ||
      (llmResponse.properties.updateInfo && llmResponse.properties.updateInfo.updateJavascriptCode)
    )
  ) {
    isCreateJs = true;
    // LLM結果のpropertiesのバリデート
    type LLMResponseProperties = LLMResponse['properties'];
    function propertiesValidate(properties: LLMResponseProperties): boolean {
      const { method, startAt, javascriptCode, linesCount, updateInfo } = properties;
      // method（CREATE / ADD / UPDATE / DELETE のいずれか）は必須
      if (!method) return false;
      // method毎のチェック
      if (method === CodeCreateMethodCreate.create) {
        // 新規の場合
        if (!javascriptCode) return false;
      } else if (method === CodeCreateMethodEdit.update) {
        // 更新の場合
        const { targetCode, targetStartAt, updateJavascriptCode } = updateInfo;

        if (!updateInfo && !targetCode && !targetStartAt && !updateJavascriptCode) return false;
      } else if (method === CodeCreateMethodEdit.add) {
        // 追加の場合
        if (!javascriptCode) return false;
      } else if (method === CodeCreateMethodEdit.delete) {
        // 削除の場合
        if (!startAt && !linesCount) return false;
      }
      return true;
    }
    if (!propertiesValidate(llmResponse.properties)) throw new LlmError(`${ErrorMessageConst.E_MSG009}（${ErrorCode.E00012}）`);

    // 出力コード編集
    let editedCode = originalCode;
    try {
      const resProperties = llmResponse.properties;
      const method = resProperties.method;

      // メソッド毎の編集処理 「新規・更新・追加・削除」
      if (method === CodeCreateMethodCreate.create || method === CodeCreateMethodEdit.add) {
        // 新規・追加の場合
        if (!editedCode) {
          // オリジナルコードが存在しない場合は、新規
          editedCode = resProperties.javascriptCode;
        } else {
          // // オリジナルコードが存在する場合は、追加
          const editedCodeLines = editedCode.split('\n');
          editedCode = modifyCode(editedCode, editedCodeLines.length + 1, 0, resProperties.javascriptCode);
        }
      } else if (method === CodeCreateMethodEdit.update) {
        // 更新の場合
        const { targetCode, targetStartAt, updateJavascriptCode } = resProperties.updateInfo;
        // 最後の改行がある場合は削除し、対象コードを行ごとの配列に分割
        const targetCodeLines = targetCode.endsWith('\n') ? targetCode.slice(0, -1).split('\n') : targetCode.split('\n');
        editedCode = modifyCode(editedCode, targetStartAt, targetCodeLines.length, updateJavascriptCode);
      } else if (method === CodeCreateMethodEdit.delete) {
        // 削除の場合
        editedCode = modifyCode(editedCode, resProperties.startAt, resProperties.linesCount);
        editedCode = removeIncompleteJSDoc(editedCode)
      }
    } catch (e) {
      throw new LlmError(`${ErrorMessageConst.E_MSG009}（${ErrorCode.E00010}）`)
    }

    // フォーマット整形
    const formattedCode = await prettier.format(editedCode, { parser: "babel", plugins: [parserBabel, prettierPluginEstree] })
      .catch(() => {
        throw new LlmError(`${ErrorMessageConst.E_MSG009}（${ErrorCode.E00010}）`)
      });

    // 結果返却
    return {
      llmResponse,
      formattedCode,
      isCreateJs,
    };
  } else {
    // JS生成されない場合はオリジナルコードを返却
    // 結果返却
    return {
      llmResponse,
      formattedCode: originalCode,
      isCreateJs,
    };
  }
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
function insertConversation(pluginId: string, appId: number, userId: string, deviceDiv: DeviceDiv, messageType: MessageType, message: string, conversationId: string, messageComment?: string, javascriptCode?: string) {
  const body = messageType == MessageType.ai ?
    { appId, userId, deviceDiv, messageType, message, conversationId, messageComment, javascriptCode } :
    { appId, userId, deviceDiv, messageType, message, conversationId }
  kintone.plugin.app.proxy(
    pluginId,
    `${import.meta.env.VITE_API_ENDPOINT}/plugin/js_gen/conversation_history/insert`,
    "POST",
    {},
    body,
  );
}