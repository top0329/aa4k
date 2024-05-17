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
import { DeviceDiv, CodeCreateMethodCreate, CodeCreateMethodEdit, ErrorCode, InfoMessage, ErrorMessage as ErrorMessageConst } from "~/constants"
import { AiResponse, Conversation, MessageType, AppCreateJsContext, kintoneFormFields } from "../../types/ai";
import { GeneratedCodeGetResponseBody, KintoneProxyResponse, KintoneRestAPiError } from "~/types/apiResponse";
import { getKintoneCustomizeJs, updateKintoneCustomizeJs } from "../../util/kintoneCustomize"
import { getApiErrorMessageForCreateJs } from "~/util/getErrorMessage"

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
    `${import.meta.env.VITE_API_ENDPOINT}/generated_code/get-code`,
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
  const { appId, userId, conversationId, deviceDiv, contractStatus, systemSettings, pluginId } = appCreateJsContext;
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
  const createMethod = z.nativeEnum(CodeCreateMethodCreate).describe("必ず'CREATE'を設定");
  const editMethod = z.nativeEnum(CodeCreateMethodEdit).describe("必ず'ADD','UPDATE','DELETE'のいずれかだけを設定");
  const zodSchema = z.object({
    resultMessage: z.string().describe("質問に対する結果メッセージ"),
    properties:
      z.object({
        method: originalCode ? editMethod : createMethod,
        startAt: z.number().describe("対象のオリジナルコードの開始の行番号"),
        endAt: z.number().describe("対象のオリジナルコードの終了の行番号"),
        linesCount: z.number().describe("対象のオリジナルコードの開始の行番号から終了行番号までの行数"),
        referenceJavascriptCode: z.string().describe("ピックアップしたテンプレートの内容"),
        jsdoc: z.string().describe("作成したjavascriptコードに必要なJSDoc"),
        javascriptCode: z.string().describe("作成したjavascriptコードにJSDocコメントを付けたもの"),
        updateInfo: z.object({
          targetCode: z.string().describe("更新対象となるオリジナルコードの開始から終了までのjavascriptコード"),
          targetStartAt: z.number().describe("更新対象となるオリジナルコードの開始の行番号"),
          updateJavascriptCode: z.string().describe("更新用のjavascriptコード"),
        }).describe("[更新]の場合の情報"),
      }).describe("作成したjavascriptの詳細"),
    supplement: z.object({
      where: z.string().describe("どの画面での処理なのか（例: 一覧画面、詳細画面、追加画面、編集画面 etc.）"), // どこで
      when: z.string().describe("何をしたときの処理なのか（例: ○○画面を表示したとき、○○フィールドを変更したとき、○○画面で保存したとき etc.）"),  // いつ
      what: z.string().describe("何に対しての処理なのか（例: タイトルを、メールアドレスを、○○のレコードを etc.）"),  // 何を
      how: z.string().describe("何をする処理なのか（例: 背景色を変更する、値をセットする、小文字に変換、無効化する etc.）"), // どのように
      contentsOfCreatedJs: z.string().describe("[where],[when],[what],[how]をもとした機能の説明（例: whereをwhenしたときに、watをhowする機能を作成しました。）"),
      instructionsToChange: z.string().describe("作成されたjavascriptに対する修正指示の具体的な例文"),
    }).describe("質問に対するメッセージの補足情報"),
    violationOfGuidelines: z.string().describe("オリジナルコードのガイドライン違反"),
    guideMessage: z.string().describe("ガイドライン違反のためユーザーの要望に答えられなかった内容（無ければブランク）"),
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
    `${import.meta.env.VITE_API_ENDPOINT}/conversation_history/insert`,
    "POST",
    {},
    body,
  );
}