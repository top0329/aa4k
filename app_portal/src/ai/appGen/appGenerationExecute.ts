import { setPrompt, executeLlm } from "../common"
import {
  AppGenerationExecuteResponseSuccess,
  AppGenerationExecuteResponseError,
  AppGenerationExecuteConversation,
  AppGenerationExecuteContext,
  PromptInfo,
} from "~/types";
import { InsertConversationRequest } from "~/types/apiInterfaces"
import { KintoneRestAPiError } from "~/types/apiInterfaces"
import {
  ActionType,
  ContractStatus,
  ServiceDiv,
  ErrorCode,
  ErrorMessage as ErrorMessageConst,
} from "~/constants"
import { insertConversation } from "~/util/insertConversationHistory"
import { LlmError, KintoneError, ContractExpiredError, ContractStatusError, ApiError } from "~/util/customErrors"

const RETRY_MAX_FIELD = 5 as const;
const RETRY_MAX_LAYOUT = 2 as const;


// LLM実行関数へ引き渡すためのパラメータ
interface LlmContext {
  userId: string;
  conversationId: string;
  sessionId: string;
}


// --------------------
// フィールド追加用
// --------------------
// kintone フィールド追加 API のパラメータ
interface KintoneFieldAddProperties {
  type: string;
  code: string;
  [key: string]: any;
}
interface KintoneFieldAdd {
  app: string;
  properties: KintoneFieldAddProperties;
}
// LLMフィールド追加パラメータ
interface LlmFieldParam {
  responseMessage: string;
  fields: KintoneFieldAddProperties;
}


// --------------------
// レイアウト変更用
// --------------------
// kintone レイアウト変更 APIのパラメータ
interface KintoneLayoutField {
  type: string;
  code?: string;
}
interface KintoneLayoutRow {
  type: string;
  fields: KintoneLayoutField[];
}
interface KintoneLayout {
  app: string;
  layout: KintoneLayoutRow[];
}
// LLMレイアウト変更パラメータ
interface LlmLayoutParam {
  responseMessage: string;
  layout: KintoneLayoutRow[];
}


/**
 * AI機能_アプリ作成の実行
 * @param conversation 
 * @returns AppGenerationExecuteResponse
 */
export const appGenerationExecute = async (conversation: AppGenerationExecuteConversation): Promise<AppGenerationExecuteResponseSuccess | AppGenerationExecuteResponseError> => {
  const { message } = conversation;
  const context = conversation.context as AppGenerationExecuteContext;
  const isGuestSpace = context.isGuestSpace;
  const sessionId = context.sessionId;

  const { promptInfoList, systemSettings } = context;
  try {
    // --------------------
    // 前処理
    // --------------------
    const promptInfo = await setPrompt([ServiceDiv.app_gen_field, ServiceDiv.app_gen_field_retry, ServiceDiv.app_gen_layout, ServiceDiv.app_gen_layout_retry], promptInfoList)

    // LLM連携用のcontext
    const llmContext: LlmContext = { userId: context.userId, conversationId: context.conversationId, sessionId: sessionId }

    // --------------------
    // アプリ作成とフィールド追加の実行
    //   ・アプリ作成の実行(kintone REST API)
    //   ・フィールド追加用パラメータ生成(LLM)
    //   ・フィールド追加の実行(kintone REST API)
    // --------------------
    const appName = context.settingInfo ? context.settingInfo.appName : "";
    const fieldList = context.settingInfo ? JSON.stringify(context.settingInfo.fields) : "";
    const { appId, fieldsParam } = await executeAppGeneration(message.content, appName, fieldList, context.contractStatus, llmContext, isGuestSpace, promptInfo)

    // --------------------
    // レイアウト変更の実行
    // --------------------
    const layoutParam = await executeLayout(appId, message.content, fieldsParam, context.contractStatus, llmContext, isGuestSpace, promptInfo)

    // --------------------
    // 作成したアプリにAA4kプラグインを追加
    // --------------------
    await setAa4kPlugin(appId, systemSettings.pluginId, isGuestSpace);

    // --------------------
    // kintone 運用環境へのデプロイ(kintone REST API)
    // --------------------
    await kintone.api(
      kintone.api.url("/k/v1/preview/app/deploy.json", isGuestSpace),
      "POST",
      { apps: [{ app: appId }] },
    ).catch((e: KintoneRestAPiError) => {
      throw new KintoneError(`${ErrorMessageConst.E_MSG012}（${ErrorCode.E10004}）\n${e.message}\n(${e.code} ${e.id})`)
    });

    // --------------------
    // 会話履歴の登録
    // --------------------
    const reqConversation: InsertConversationRequest = {
      userId: context.userId,
      sessionId: sessionId,
      actionType: ActionType.complete,
      resultMessage: "",
      resultMessageDetail: "",
      aiResponse: JSON.stringify({
        fieldsParam: fieldsParam,
        layoutParam: layoutParam.layout
      }),
      appId: appId,
      conversationId: context.conversationId,
    };
    await insertConversation(reqConversation);

    // --------------------
    // コールバック関数の設定
    // --------------------
    const redirectPath = `/k/${appId}/`
    const callbackFuncs: Function[] = [];
    callbackFuncs.push(() => {
      setTimeout(() => {
        (location.href = redirectPath)
      }, 3000)
    })

    return {
      result: "success",
      callbacks: callbackFuncs,
    }
  } catch (err) {
    console.log(err)
    let message: string = "";
    if (err instanceof LlmError
      || err instanceof KintoneError
      || err instanceof ContractExpiredError
      || err instanceof ContractStatusError
      || err instanceof ApiError
    ) {
      message = err.message
    } else {
      message = `${ErrorMessageConst.E_MSG011}（${ErrorCode.E99999}）`;
    }
    // 会話履歴の登録
    const reqConversation: InsertConversationRequest = {
      userId: context.userId,
      sessionId: sessionId,
      actionType: ActionType.error,
      resultMessage: message,
      resultMessageDetail: "",
      conversationId: context.conversationId,
    };
    await insertConversation(reqConversation);

    // 返却
    const resMessage = `${ErrorMessageConst.E_MSG003}（${ErrorCode.E99999}）\n${ErrorMessageConst.E_MSG002}`
    return { result: ActionType.error, errorMessage: resMessage }
  }
}


/**
 * アプリ作成の実行
 * @param message 
 * @param appName 
 * @param fieldList 
 * @param contractStatus 
 * @param llmContext 
 * @param promptInfo 
 * @returns appId, fieldsParam
 */
async function executeAppGeneration(message: string, appName: string, fieldList: string, contractStatus: ContractStatus, llmContext: LlmContext, isGuestSpace: boolean, promptInfo: PromptInfo[]) {
  let maxRetries = RETRY_MAX_FIELD; // 最大リトライ回数
  let retryCount = 0;
  let success = false;
  let errorInfo = "";

  // 動作テスト環境にアプリを作成する
  const kintoneAppBody = {
    name: appName,
  };
  const kintoneAppResult = await kintone.api(
    kintone.api.url("/k/v1/preview/app.json", isGuestSpace),
    "POST",
    kintoneAppBody,
  ).catch((e: KintoneRestAPiError) => {
    throw new KintoneError(`${ErrorMessageConst.E_MSG012}（${ErrorCode.E10004}）\n${e.message}\n(${e.code} ${e.id})`)
  });
  const appId = kintoneAppResult.app;

  // フィールド追加用パラメータ生成(LLM)の実行
  let fieldsParam: LlmFieldParam = await llmAppGenFieldParam(message, appName, fieldList, contractStatus, llmContext, promptInfo);
  while (retryCount < maxRetries && !success) {
    try {
      if (retryCount !== 0) {
        // フィールド追加用パラメータ生成_リトライ(LLM)の実行
        fieldsParam = await llmAppGenFieldRetryParam(message, appName, contractStatus, llmContext, promptInfo, fieldsParam, errorInfo);
      }

      // フィールド追加の実行(kintone REST API)
      await kintoneAppGenFieldAdd(appId, fieldsParam, isGuestSpace);
      success = true;
    } catch (e) {
      // エラーの場合はエラー内容を設定
      errorInfo = JSON.stringify(e);
      retryCount++;
      if (retryCount >= maxRetries) {
        // 最大リトライ回数を超えたらエラー
        throw new Error(`${ErrorMessageConst.E_MSG012}（${ErrorCode.E10008}）`);
      }
    }
  }

  return { appId, fieldsParam };
}

/**
 * フィールド追加用パラメータ生成(LLM)
 * @param message 
 * @param appName 
 * @param fieldList 
 * @param contractStatus 
 * @param llmContext 
 * @param promptInfo 
 * @returns result
 */
async function llmAppGenFieldParam(message: string, appName: string, fieldList: string, contractStatus: ContractStatus, llmContext: LlmContext, promptInfo: PromptInfo[]) {
  const prompt = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_field);
  const promptParam = {
    appName: appName,
    fieldList: fieldList,
  };
  const result = await executeLlm(message, [], contractStatus, prompt[0], promptParam, llmContext)
  // 型変換
  const kintoneField: LlmFieldParam = {
    responseMessage: result.responseMessage || "",
    fields: result.fields || {},
  };

  return kintoneField;
}


/**
 * フィールド追加用パラメータ生成_リトライ(LLM)
 * @param message 
 * @param appName 
 * @param contractStatus 
 * @param llmContext 
 * @param promptInfo 
 * @param fieldParam 
 * @param errorInfo 
 * @returns result
 */
async function llmAppGenFieldRetryParam(message: string, appName: string, contractStatus: ContractStatus, llmContext: LlmContext, promptInfo: PromptInfo[], fieldParam: LlmFieldParam, errorInfo: string) {
  const prompt = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_field_retry);
  const promptParam = {
    appName: appName,
    fieldParam: JSON.stringify(fieldParam.fields),
    errorInfo: errorInfo,
  };
  // LLM実行
  const result = await executeLlm(message, [], contractStatus, prompt[0], promptParam, llmContext)
  // 型変換
  const kintoneField: LlmFieldParam = {
    responseMessage: result.responseMessage || "",
    fields: result.fields || {},
  };

  return kintoneField;
}


/**
 * フィールド追加の実行(kintone REST API)
 * @param appId 
 * @param kintoneFieldAddProperties 
 */
async function kintoneAppGenFieldAdd(appId: string, fieldParam: LlmFieldParam, isGuestSpace: boolean) {
  const kintoneFormFieldsBody: KintoneFieldAdd = {
    app: appId,
    properties: fieldParam.fields,
  };
  await kintone.api(
    kintone.api.url("/k/v1/preview/app/form/fields.json", isGuestSpace),
    "POST",
    kintoneFormFieldsBody,
  ).catch((e: KintoneRestAPiError) => {
    throw e
  });
}

/**
 * アプリにAA4kプラグインを追加
 * @param appId 
 * @param pluginId
 * @param isGuestSpace
 */
async function setAa4kPlugin(appId: string, pluginId: string, isGuestSpace: boolean) {
  interface Plugins {
    id: string;
    name: string;
    isMarketPlugin: boolean;
    version: string
  }
  interface Plugin {
    plugins: Plugins[];
  }

  // --------------------
  // プラグイン一覧の取得
  // --------------------
  const response: Plugin = await kintone.api(
    kintone.api.url("/k/v1/plugins.json", isGuestSpace),
    "GET",
    {},
  ).catch((e: KintoneRestAPiError) => {
    throw new KintoneError(`${ErrorMessageConst.E_MSG012}（${ErrorCode.E10004}）\n${e.message}\n(${e.code} ${e.id})`)
  });

  // --------------------
  // AA4kプラグインのプラグインIDを名前から抽出
  // --------------------
  const aa4kPluginId = response.plugins.find(plugin => plugin.id === pluginId)?.id;
  if (!aa4kPluginId) {
    // 存在しない場合は何もしない
    return;
  }

  // --------------------
  // アプリにプラグインを追加する
  // --------------------
  await kintone.api(
    kintone.api.url("/k/v1/preview/app/plugins.json", isGuestSpace),
    "POST",
    { app: appId, ids: [aa4kPluginId] },
  ).catch((e: KintoneRestAPiError) => {
    throw new KintoneError(`${ErrorMessageConst.E_MSG012}（${ErrorCode.E10004}）\n${e.message}\n(${e.code} ${e.id})`)
  });
}



/**
 * レイアウト変更の実行
 * @param message 
 * @param appName 
 * @param fieldList 
 * @param contractStatus 
 * @param llmContext 
 * @param promptInfo 
 * @returns appId, fieldParam
 */
async function executeLayout(appId: string, message: string, fieldsParam: LlmFieldParam, contractStatus: ContractStatus, llmContext: LlmContext, isGuestSpace: boolean, promptInfo: PromptInfo[]) {
  let maxRetries = RETRY_MAX_LAYOUT; // 最大リトライ回数
  let retryCount = 0;
  let success = false;
  let errorInfo = "";

  // レイアウト変更用パラメータ生成(LLM)の実行
  let layoutParam = await llmLayoutParam(message, fieldsParam, contractStatus, llmContext, promptInfo);
  let updatedLayout = addMissingFieldsToLayout(fieldsParam, layoutParam);
  while (retryCount < maxRetries && !success) {
    try {
      if (retryCount !== 0) {
        // レイアウト変更用パラメータ生成_リトライ(LLM)の実行
        layoutParam = await llmLayoutParamRetry(message, contractStatus, llmContext, promptInfo, layoutParam, errorInfo);
        updatedLayout = addMissingFieldsToLayout(fieldsParam, layoutParam);
      }

      // レイアウト変更の実行(kintone REST API)
      await kintoneLayout(appId, updatedLayout, isGuestSpace);
      success = true;
    } catch (e) {
      // エラーの場合はエラー内容を設定
      errorInfo = JSON.stringify(e);
      retryCount++;
      if (retryCount >= maxRetries) {
        // 最大リトライ回数を超えても何もしない(レイアウト変更なしでアプリ生成完了とする)
      }
    }
  }

  return updatedLayout;
}

/**
 * レイアウト変更用パラメータ生成(LLM)
 * @param message 
 * @param appName 
 * @param fieldList 
 * @param contractStatus 
 * @param llmContext 
 * @param promptInfo 
 * @returns result
 */
async function llmLayoutParam(message: string, fieldsParam: LlmFieldParam, contractStatus: ContractStatus, llmContext: LlmContext, promptInfo: PromptInfo[]) {
  const prompt = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_layout);
  const promptParam = {
    fields: JSON.stringify(fieldsParam.fields),
  };
  // LLM実行
  const result = await executeLlm(message, [], contractStatus, prompt[0], promptParam, llmContext)

  //  結果をKintoneLayoutRow型に変換
  const kintoneLayout: LlmLayoutParam = {
    responseMessage: result.responseMessage || "",
    layout: result.layout || [],
  };

  return kintoneLayout;
}


/**
 * レイアウト変更用パラメータ生成_リトライ(LLM)
 * @param message 
 * @param appName 
 * @param contractStatus 
 * @param llmContext 
 * @param promptInfo 
 * @param layoutParam 
 * @param errorInfo 
 * @returns result
 */
async function llmLayoutParamRetry(message: string, contractStatus: ContractStatus, llmContext: LlmContext, promptInfo: PromptInfo[], layoutParam: LlmLayoutParam, errorInfo: string) {
  const prompt = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_layout_retry);
  const promptParam = {
    layoutParam: JSON.stringify(layoutParam.layout),
    errorInfo: errorInfo,
  };
  const result = await executeLlm(message, [], contractStatus, prompt[0], promptParam, llmContext)

  //  結果をKintoneLayoutRow型に変換
  const kintoneLayout: LlmLayoutParam = {
    responseMessage: result.responseMessage || "",
    layout: result.layout || [],
  };

  return kintoneLayout;
}


/**
 * レイアウト変更の実行(kintone REST API)
 * @param appId 
 * @param layoutParam 
 * @param isGuestSpace 
 */
async function kintoneLayout(appId: string, layoutParam: LlmLayoutParam, isGuestSpace: boolean) {

  const kintoneFormLayoutBody: KintoneLayout = {
    app: appId,
    layout: layoutParam.layout,
  };
  await kintone.api(
    kintone.api.url("/k/v1/preview/app/form/layout.json", isGuestSpace),
    "PUT",
    kintoneFormLayoutBody,
  ).catch((e: KintoneRestAPiError) => {
    throw e
  });
}


/**
 * レイアウト変更の調整
 * レイアウト変更パラメータに不足しているフィールドを末尾に追加
 * @param properties 
 * @param layout 
 * @returns 
 */
function addMissingFieldsToLayout(fieldsParam: LlmFieldParam, layoutParam: LlmLayoutParam): LlmLayoutParam {
  const fieldCodesInLayout = new Set<string>();
  layoutParam.layout.forEach(row => {
    row.fields.forEach(field => {
      if (field.code) {
        fieldCodesInLayout.add(field.code);
      }
    });
  });

  const missingFields: KintoneLayoutField[] = [];
  for (const code in fieldsParam.fields) {
    if (fieldsParam.fields.hasOwnProperty(code) && !fieldCodesInLayout.has(code)) {
      const field = fieldsParam.fields[code];
      if (field.type !== "SUBTABLE") {
        missingFields.push({ type: field.type, code: code });
      }
    }
  }

  if (missingFields.length > 0) {
    layoutParam.layout.push({ type: "ROW", fields: missingFields });
  }

  return {
    responseMessage: layoutParam.responseMessage,
    layout: layoutParam.layout
  };
}
