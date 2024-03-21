import { ChatPromptTemplate } from "@langchain/core/prompts"
import { Document } from "@langchain/core/documents";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { AIMessage, BaseMessage, HumanMessage } from "langchain/schema"

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { v4 as uuidv4 } from 'uuid';

import { APP_CREATE_JS_SYSTEM_PROMPT } from "./prompt"
import { addLineNumbersToCode, modifyCode } from "./util"
import { CodeTemplateRetriever } from "./retriever";
import { LangchainLogsInsertCallbackHandler } from "../langchainLogsInsertCallbackHandler";
import { openAIModel, getCodingGuidelines } from "../common"
import { DeviceDiv, CodeCreateMethod, ErrorCode, InfoMessage, ErrorMessage as ErrorMessageConst } from "~/constants"
import { AiResponse, Conversation, MessageType, AppCreateJsContext, kintoneFormFields } from "../../types/ai";
import { GeneratedCodeGetResponseBody, KintoneProxyResponse, KintoneRestAPiError } from "~/types/apiResponse";
import { getKintoneCustomizeJs, updateKintoneCustomizeJs } from "../../util/kintoneCustomize"
import { getApiErrorMessage } from "~/util/getErrorMessage"

import { LlmError, KintoneError, ApiError, GuidelineError, RetrieveError, ContractExpiredError, ContractStatusError } from "~/util/customErrors"

import * as prettier from "prettier/standalone"
import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";

/**
 * kintoneカスタマイズJavascript生成
 * @param conversation 
 * @param codeEditorVisible 
 * @param isChangeCode 
 * @param setCode 
 * @param setCodeLatest 
 * @param isChangeCodeRef 
 * @returns AiResponse
 */
export const appCreateJs = async (
  conversation: Conversation,
  codeEditorVisible: boolean,
  isChangeCode: boolean,
  setCode: React.Dispatch<React.SetStateAction<string>>,
  setCodeLatest: React.Dispatch<React.SetStateAction<string>>,
  isChangeCodeRef?: React.MutableRefObject<boolean>
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
    const { llmResponse, formattedCode } = await createJs(conversation, fieldInfo, isLatestCode, codingGuidelineList, codeTemplate, originalCode, sessionId);

    // --------------------
    // レスポンス設定
    // --------------------
    let message = `${llmResponse.resultMessage}`;
    const autoComplete = llmResponse.autoComplete ? `補足：\n${llmResponse.autoComplete}\n\n` : '';
    const correctionInstructions = llmResponse.correctionInstructions ? `変更例：\n${llmResponse.correctionInstructions}\n\n` : '';
    const guideMessage = llmResponse.guideMessage ? `ガイドライン違反：\n${llmResponse.guideMessage}\n` : '';

    // テンプレートリテラルを使用して、最終的なメッセージを組み立てる。
    const messageComment = `${autoComplete}${correctionInstructions}${guideMessage}`.trim();

    // --------------------
    // 回答メッセージと生成したコードの登録 (会話履歴TBL)
    // --------------------
    insertConversation(pluginId, appId, userId, deviceDiv, MessageType.ai, message, conversationId, messageComment, formattedCode)

    // JS生成された場合のみ、kintoneへの反映と、コールバック関数の設定を行う
    if (llmResponse.properties.length) {
      // --------------------
      // kintoneカスタマイズへの反映
      // --------------------
      await updateKintoneCustomizeJs(formattedCode, targetFileKey, kintoneCustomizeFiles, appId, deviceDiv, isGuestSpace);

      // --------------------
      // コールバック関数設定(コード生成後の動作)
      // --------------------
      const redirectPath = `/k/admin/preview/${appId}/`;
      const currentUrl = location.href;
      if (currentUrl.includes(redirectPath)) {
        // プレビュー画面の場合
        callbackFuncs.push(createPreviewEnvCallbackFunc({
          redirectPath,
          codeEditorVisible,
          isChangeCode,
          formattedCode,
          setCode,
          setCodeLatest,
          isChangeCodeRef
        }));
      } else {
        // 本番画面の場合
        callbackFuncs.push(createProdEnvCallbackFunc({
          redirectPath,
          codeEditorVisible,
          isChangeCode,
          formattedCode,
          setCode,
          setCodeLatest,
          isChangeCodeRef
        }));
      }
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
      const message = `${ErrorMessageConst.E_MSG001}（${ErrorCode.E99999}）`;
      insertConversation(pluginId, appId, userId, deviceDiv, MessageType.error, message, conversationId)
      return { message: { role: MessageType.error, content: message } }
    }
  }
}

type CreateCallbackFuncProps = {
  redirectPath: string;
  codeEditorVisible: boolean;
  isChangeCode: boolean;
  formattedCode: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  setCodeLatest: React.Dispatch<React.SetStateAction<string>>;
  isChangeCodeRef?: React.MutableRefObject<boolean>;
}

/**
 * プレビュー画面の場合のコールバック関数を作成
 * @param redirectPath 
 * @param codeEditorVisible 
 * @param isChangeCode 
 * @param isChangeCodeRef 
 */
const createPreviewEnvCallbackFunc = ({ redirectPath, codeEditorVisible, isChangeCode, isChangeCodeRef }: CreateCallbackFuncProps) => {
  const previewEnvCallbackFunc = () => {
    if (codeEditorVisible && isChangeCode) {
      // コードエディタのコードが編集されていたら、確認モーダルを表示
      if (window.confirm(`${InfoMessage.I_MSG002}`)) {
        if (isChangeCodeRef) {
          isChangeCodeRef.current = false;
        }
        // テスト環境画面に遷移する
        (location.href = redirectPath)
      }
    } else {
      // テスト環境画面に遷移する
      (location.href = redirectPath)
    }
  }

  return previewEnvCallbackFunc;
}

/**
 * 本番画面の場合のコールバック関数を作成
 * @param redirectPath 
 * @param codeEditorVisible 
 * @param isChangeCode 
 * @param isChangeCodeRef 
 */
const createProdEnvCallbackFunc = ({ redirectPath, codeEditorVisible, isChangeCode, formattedCode, setCode, setCodeLatest, isChangeCodeRef }: CreateCallbackFuncProps) => {
  const prodEnvCallbackFunc = () => {
    // 画面遷移の確認モーダルを表示
    if (window.confirm(`${InfoMessage.I_MSG001}`)) {
      if (codeEditorVisible && isChangeCode) {
        // コードエディタのコードが編集されていたら、確認モーダルを表示
        if (window.confirm(`${InfoMessage.I_MSG002}`)) {
          if (isChangeCodeRef) {
            isChangeCodeRef.current = false;
          }
          // テスト環境画面に遷移する
          (location.href = redirectPath)
        }
      } else {
        (location.href = redirectPath)
      }
    } else {
      if (codeEditorVisible) {
        // コードエディタ表示中の場合、、確認モーダルを表示
        const infoMessage = isChangeCode ? `${InfoMessage.I_MSG007}` : `${InfoMessage.I_MSG006}`;
        if (window.confirm(infoMessage)) {
          // 作成したJavaScriptに置き換え
          setCode(formattedCode);
          setCodeLatest(formattedCode);
        }
      }
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
    `${import.meta.env.VITE_API_ENDPOINT}/generated_code/get-code`,
    "POST",
    {},
    { appId: appId, userId: userId, deviceDiv: deviceDiv, conversationId: conversationId },
  ) as KintoneProxyResponse;
  const [res_jsCodeForDbBody, res_jsCodeForDbStatus] = res_jsCodeForDb;
  const resJson_jsCodeForDb = JSON.parse(res_jsCodeForDbBody) as GeneratedCodeGetResponseBody;
  if (res_jsCodeForDbStatus !== 200) {
    const errorMessage = getApiErrorMessage(res_jsCodeForDbStatus, resJson_jsCodeForDb.errorCode)
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
  const { appId, userId, conversationId, contractStatus, systemSettings, pluginId } = appCreateJsContext;
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
  // 生成（LLM実行）
  const handler = new LangchainLogsInsertCallbackHandler({ pluginId, sessionId, appId, userId, conversationId });
  const model = openAIModel(pluginId, sessionId, contractStatus);
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
    codeTemplate: codeTemplate.map((template) => template.pageContent),
  }, { callbacks: [handler] }).catch((err) => {
    if (err.code === "invalid_api_key") {
      throw new LlmError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00009}）`)
    } else {
      throw new LlmError(`${ErrorMessageConst.E_MSG001}（${ErrorCode.E00004}）`)
    }
  })) as LLMResponse;

  if (llmResponse.properties.length) {
    // JS生成された場合はコード編集して返却
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
  } else {
    // JS生成されない場合はオリジナルコードを返却
    // 結果返却
    return {
      llmResponse,
      formattedCode: originalCode
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
    `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/insert`,
    "POST",
    {},
    body,
  );
}