import { v4 as uuidv4 } from 'uuid';
import { setPrompt, executeLlm, ExecuteLlmContext, PromptParam, } from "../common"
import { ErrorCode, ErrorMessage as ErrorMessageConst, ServiceDiv, ContractStatus, ActionType } from "~/constants"
import { AiResponse, Conversation, MessageType, DataGenContext, kintoneFormFields, KintoneFormFieldsProperties, PromptInfo } from "../../types/ai";
import { KintoneRestAPiError } from "~/types/apiResponse";

import { LlmError, KintoneError, ContractExpiredError, ContractStatusError } from "~/util/customErrors"

// kintone予約フィールド
const KINTONE_FIXED_FIELD = ["カテゴリー", "レコード番号", "作業者", "更新者", "作成者", "ステータス", "更新日時", "作成日時"] as const;
// ダミーデータ生成できないフィールドタイプ
const NO_DATA_GEN_FIELD_TYPE_LIST = [
  { type: "FILE", name: "添付ファイル" },
  { type: "USER_SELECT", name: "ユーザー選択" },
  { type: "ORGANIZATION_SELECT", name: "組織選択" },
  { type: "GROUP_SELECT", name: "グループ選択" }
] as const;

// --------------------
// レコード登録用
// --------------------
// kintone レコード登録 API のパラメータ
interface KintoneRecords {
  [key: string]: any;
}
// LLMレコード登録パラメータ
interface LlmRecordsParam {
  responseMessage: string;
  records: KintoneRecords[];
}

interface KintoneGetRecords {
  records: KintoneRecords[];
  totalCount: string;
}

interface FieldInfo {
  type: string;
  code: string;
  label: string;
  required: boolean;
  minLength?: string;
  maxLength?: string;
  minValue?: string;
  maxValue?: string;
  unique?: boolean;
}

interface UniqueData {
  [key: string]: string[]
}
/**
 * AI機能_データ生成
 * @param conversation 
 * @returns AiResponse
 */
export const dataGenerationExecute = async (conversation: Conversation, setIsReload: React.Dispatch<React.SetStateAction<boolean>>): Promise<AiResponse> => {
  const { message, } = conversation;
  const context = conversation.context as DataGenContext;
  const { appId, userId, conversationId, contractStatus, pluginId, isGuestSpace, promptInfoList } = context;
  const sessionId = uuidv4();
  const callbackFuncs: Function[] = [];
  try {
    // --------------------
    // 前処理
    // --------------------
    const promptInfo = await setPrompt(pluginId, [ServiceDiv.dat_gen_count, ServiceDiv.dat_gen_record, ServiceDiv.dat_gen_record_retry], promptInfoList)

    // --------------------
    // フィールド情報の取得
    // --------------------
    const getField_res = await kintone.api(
      kintone.api.url("/k/v1/app/form/fields", isGuestSpace),
      "GET", { app: appId },
    ).catch((e: KintoneRestAPiError) => {
      throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`)
    }) as kintoneFormFields;

    // --------------------
    // ・ダミーデータを生成することが難しいフィールドの対応
    // ・対象とするフィールドタイプの除外
    // --------------------
    const { fieldInfo, requiredFieldLabels } = filterFields(getField_res.properties)

    // ダミーデータ生成できないフィールドタイプに必須項目が設定されている場合
    if (requiredFieldLabels.length) {
      // 返却メッセージ設定
      const fieldNames = NO_DATA_GEN_FIELD_TYPE_LIST.map(item => `[${item.name}]`).join('');
      const targetFields = requiredFieldLabels.map(field => `- ${field}`).join('\n')
      const message = `${fieldNames}のいずれかに必須項目の設定がある場合、ダミーデータ生成の機能はご利用できません。\n\nエラーとなるフィールド:\n${targetFields}`

      // 会話履歴の登録
      insertConversation(pluginId, appId, userId, MessageType.ai, message, conversationId)
      // 終了
      return {
        message: { role: "ai", content: message, comment: "", },
        callbacks: callbackFuncs,
      };
    }


    // --------------------
    // 件数抽出(LLM)
    // --------------------
    const llmContext = { userId: userId, appId: appId, conversationId: conversationId, sessionId: sessionId }
    const countPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.dat_gen_count);
    const countLlmResult = await executeLlm(message.content, [], contractStatus, countPromptInfo[0], {}, llmContext, pluginId)

    // 結果を格納
    const actionType: string = countLlmResult.actionType;
    const createCount: number = countLlmResult.createCount;
    const condition: string = countLlmResult.condition;
    let responseMessage: string = countLlmResult.responseMessage;
    let generatedData = "";

    // レコード追加判定(件数が0件の場合、または、タイプが「作成」以外はfalse)
    const isAddRecords = (createCount > 0 || actionType === ActionType.create);
    if (isAddRecords) {
      // --------------------
      // レコード追加処理
      // --------------------
      const resultAddRecord = await executeAddRecordsParallel(condition, createCount, appId, JSON.stringify(fieldInfo), contractStatus, pluginId, llmContext, promptInfo, isGuestSpace)
      generatedData = JSON.stringify(resultAddRecord.records);

      // エラーで登録できなかったものがある場合
      if (resultAddRecord.errorCount) {
        if (createCount === resultAddRecord.errorCount) {
          // 全て失敗した場合
          responseMessage = `データの登録に失敗しました。お手数ですが、もう一度お試しください。`
        } else {
          // 一部失敗した場合
          responseMessage = `${condition}のデータを${resultAddRecord.successCount}件登録しましたが、一部、データの生成が出来ませんでした。\n内容をご確認いただき、必要に応じて再度お試しください。`
        }
      }
      // --------------------
      // コールバック関数の設定
      // --------------------
      setIsReload(true);
      callbackFuncs.push(() => {
        setTimeout(() => {
          (location.reload())
        }, 3000)
      })
    }

    // --------------------
    // 会話履歴の登録
    // --------------------
    insertConversation(pluginId, appId, userId, MessageType.ai, responseMessage, conversationId, generatedData)

    // 終了
    return {
      message: {
        role: "ai",
        content: responseMessage,
        comment: "",
      },
      callbacks: callbackFuncs,
    };

  } catch (err) {
    console.log("err:", err)
    if (err instanceof LlmError
      || err instanceof KintoneError
      || err instanceof ContractExpiredError
      || err instanceof ContractStatusError
    ) {
      const message = err.message;
      insertConversation(pluginId, appId, userId, MessageType.error, message, conversationId)
      return { message: { role: MessageType.error, content: message, } }
    } else {
      const message = `${ErrorMessageConst.E_MSG011}（${ErrorCode.E99999}）`;
      insertConversation(pluginId, appId, userId, MessageType.error, message, conversationId)
      return { message: { role: MessageType.error, content: message } }
    }
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
function insertConversation(pluginId: string, appId: number, userId: string, messageType: MessageType, message: string, conversationId: string, generatedData?: string) {
  const body = messageType == MessageType.ai ?
    { appId, userId, messageType, message, conversationId, generatedData } :
    { appId, userId, messageType, message, conversationId }
  kintone.plugin.app.proxy(
    pluginId,
    `${import.meta.env.VITE_API_ENDPOINT}/plugin/data_gen/conversation_history/insert`,
    "POST",
    {},
    body,
  );
}


/**
 * レコード追加の並列実行
 * @param message 
 * @param createCount 
 * @param oneCreateCount 
 * @param appId 
 * @param fieldInfo 
 * @param contractStatus 
 * @param pluginId 
 * @param llmContext 
 * @param promptInfo 
 * @param isGuestSpace 
 * @returns responseMessage, records
 */
async function executeAddRecordsParallel(
  message: string,
  createCount: number,
  appId: number,
  fieldInfo: string,
  contractStatus: ContractStatus,
  pluginId: string,
  llmContext: ExecuteLlmContext,
  promptInfo: PromptInfo[],
  isGuestSpace: boolean
) {
  // unique設定されているフィールド一覧の抽出
  const uniqueKeys = extractUniqueKeys(JSON.parse(fieldInfo))
  // unique設定されているフィールドのデータを抽出 unique設定されているフィールドが無ければ取得をせずブランクを設定
  const uniqueData = uniqueKeys.length ? await getUniqueData(appId, uniqueKeys, isGuestSpace) : "";

  // フィールド数
  const fieldCount = Object.keys(JSON.parse(fieldInfo)).length

  // 並列実行数と並列実行1回で作成する件数の最大値を算出
  const parallel = calculateParallelExecutionArray(createCount, fieldCount)

  // 並列実行する関数配列を準備
  const llmPromises = parallel.map((count) => {
    return executeAddRecords(message, count, appId, fieldInfo, contractStatus, pluginId, llmContext, promptInfo, uniqueKeys, uniqueData, isGuestSpace)
  });

  // llmRecordsを並列実行
  const result = await Promise.all(llmPromises);

  // 並列実行した結果を設定
  const responseMessage = result[0].responseMessage;
  const records = result.map(item => item.records);
  const successCount = result.map(item => item.successCount).reduce((acc, curr) => acc + curr, 0);
  const errorCount = result.map(item => item.errorCount).reduce((acc, curr) => acc + curr, 0);
  const errorInfo = result.map(item => item.errorInfo);

  // 結果を返却
  return { responseMessage: responseMessage, records: records, successCount, errorCount, errorInfo };
}


/**
 * レコード追加の実行
 * @param message 
 * @param createCount 
 * @param appId 
 * @param fieldInfo 
 * @param contractStatus 
 * @param pluginId 
 * @param llmContext 
 * @param promptInfo 
 * @param isGuestSpace 
 * @returns responseMessage, records
 */
async function executeAddRecords(
  message: string,
  createCount: number,
  appId: number,
  fieldInfo: string,
  contractStatus: ContractStatus,
  pluginId: string,
  llmContext: ExecuteLlmContext,
  promptInfo: PromptInfo[],
  uniqueKeys: string[],
  uniqueData: UniqueData | string,
  isGuestSpace: boolean
) {
  let maxRetries = 5; // 最大リトライ回数
  let retryCount = 0;
  let success = false;
  let errorInfo = "";
  let errorCount = 0

  // プロンプトの設定
  const recordPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.dat_gen_record);
  // プロンプトへ渡すパラメータ
  const promptParam = { fields: fieldInfo, createCount: createCount, condition: message, uniqueData: uniqueData ? JSON.stringify(uniqueData) : "" };

  // [LLM] レコード追加用パラメータ生成
  let recordsParam = await llmRecords(contractStatus, pluginId, llmContext, recordPromptInfo[0], promptParam);

  // フィールド設定に合わせた調整
  const { records } = adjustRecords(recordsParam, JSON.parse(fieldInfo))
  recordsParam.records = records; // 書き換え

  // リトライ用ループ
  while (retryCount < maxRetries && !success) {
    try {
      // 初回は無視
      if (retryCount !== 0) {
        // フィールド追加用パラメータ生成_リトライ(LLM)の実行

        // unique設定されているフィールドのデータを抽出 unique設定されているフィールドが無ければ取得をせずブランクを設定
        const uniqueData = uniqueKeys.length ? await getUniqueData(appId, uniqueKeys, isGuestSpace) : "";

        // プロンプトの設定
        const recordPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.dat_gen_record_retry);
        // プロンプトへ渡すパラメータ
        const promptParam = { fields: fieldInfo, records: JSON.stringify(recordsParam.records), errorInfo: errorInfo, uniqueData: uniqueData ? JSON.stringify(uniqueData) : "" };
        // [LLM] レコード追加用パラメータ生成_リトライ
        recordsParam = await llmRecords(contractStatus, pluginId, llmContext, recordPromptInfo[0], promptParam);
        const { records } = adjustRecords(recordsParam, JSON.parse(fieldInfo))
        recordsParam.records = records; // 書き換え
      }

      // レコード追加の実行(kintone REST API)
      await kintoneRecords(appId, recordsParam, isGuestSpace);
      success = true;
    } catch (e) {
      // エラーの場合はエラー内容を設定
      errorInfo = JSON.stringify(e);
      retryCount++;
      if (retryCount >= maxRetries) {
        errorCount = createCount;
      }
    }
  }

  const resErrorInfo = errorInfo ? JSON.parse(errorInfo) : errorInfo as KintoneRestAPiError | "";
  // 結果を返却
  return {
    responseMessage: recordsParam.responseMessage,
    records: recordsParam.records,
    successCount: createCount - errorCount,
    errorCount: errorCount,
    errorInfo: resErrorInfo.message,
  };
}



/**
 * フィールド追加用パラメータ生成(LLM)
 * @returns result
 */
async function llmRecords(contractStatus: ContractStatus, pluginId: string, llmContext: ExecuteLlmContext, prompt: PromptInfo, promptParam: PromptParam) {
  // 一貫したデータではなく、ランダムなデータを生成してほしいため、[temperature=0] [seed=未設定] を設定して実行
  const result = await executeLlm("", [], contractStatus, prompt, promptParam, llmContext, pluginId, 1, {})

  // 型変換
  const kintoneLayout: LlmRecordsParam = {
    responseMessage: result.responseMessage || "",
    records: result.records || [],
  };

  return kintoneLayout;
}


/**
 * レコード追加の実行(kintone REST API)
 * @param appId 
 * @param records 
 */
async function kintoneRecords(appId: number, records: LlmRecordsParam, isGuestSpace: boolean) {

  const kintoneFormLayoutBody = {
    app: appId,
    records: records.records,
  };
  await kintone.api(
    kintone.api.url("/k/v1/records.json", isGuestSpace),
    "POST",
    kintoneFormLayoutBody,
  ).catch((e: KintoneRestAPiError) => {
    throw e
  });
}

/**
 * 作成件数とフィールド数から並列実行する数を算出する
 * @param createCount 
 * @param fieldCount 
 * @returns 
 */
function calculateParallelExecutionArray(createCount: number, fieldCount: number) {
  const MAX_E = 30; // Eの最大値

  // A: 作成総件数 createCount
  // B: フィールド数 fieldCount

  // D: 並列実行数を計算し、繰り上げ
  let parallelCount = Math.ceil((createCount * fieldCount) / 100);

  // E: 並列実行1回で作成する件数を計算
  let oneCount = Math.min(Math.floor(createCount / parallelCount), MAX_E);

  // 配列を作成
  const resultArray: number[] = [];
  let remaining = createCount;

  while (remaining > 0) {
    if (remaining >= oneCount) {
      resultArray.push(oneCount);
      remaining -= oneCount;
    } else {
      resultArray.push(remaining);
      remaining = 0;
    }
  }
  return resultArray;
}


/**
 * 処理対象となるフィールドを設定
 * @param fieldInfo 
 * @returns 
 */
function filterFields(fieldInfo: KintoneFormFieldsProperties) {
  const filterFieldInfo: KintoneFormFieldsProperties = {};
  const requiredFieldLabels: string[] = [];
  const excludedFields: string[] = [];

  // 不要なフィールドを除外
  for (const key of Object.keys(fieldInfo)) {
    const fieldType = fieldInfo[key].type;
    const fieldLabel = fieldInfo[key].label;
    const isLookup = fieldInfo[key].lookup ? true : false;
    const isRequired = fieldInfo[key].required ? true : false;

    // kintone予約フィールドを除外
    if ((KINTONE_FIXED_FIELD as readonly string[]).includes(key)) {
      continue;
    }

    // 関連テーブルとルックアップを除外(アプリ参照フィールドのため)
    if (fieldType === "REFERENCE_TABLE" || isLookup) {
      excludedFields.push(key);
      continue;
    }

    // 添付ファイル、ユーザー選択、組織選択、グループ選択を除外(正しい設定値が生成できないため)
    if (NO_DATA_GEN_FIELD_TYPE_LIST.some(item => item.type === fieldType)) {
      if (isRequired) requiredFieldLabels.push(fieldLabel); // ダミーデータ生成できないフィールドタイプに必須項目が設定されている場合
      excludedFields.push(key);
      continue;
    }

    // 除外対象外のものを格納
    filterFieldInfo[key] = fieldInfo[key];
  };

  return { fieldInfo: filterFieldInfo, requiredFieldLabels, excludedFields };
}



/**
 * フィールド設定に合わせた調整
 * @param recordsParam 
 * @param fieldInfo 
 * @returns 
 */
function adjustRecords(recordsParam: LlmRecordsParam, fieldInfo: { [key: string]: FieldInfo }) {

  const adjustedRecords = recordsParam.records.map((record: KintoneRecords) => {
    const adjustedRecord: KintoneRecords = {};
    for (const [fieldName, field] of Object.entries(record)) {
      const info = fieldInfo[fieldName];
      if (!info) continue;

      let value = field.value;

      // 値の範囲
      switch (info.type) {
        case 'SINGLE_LINE_TEXT':
        case 'LINK':
          value = adjustTextLength(value, info);
          break;
        case 'NUMBER':
          value = adjustNumber(value, info);
          break;
      }

      adjustedRecord[fieldName] = { value };
    }
    return adjustedRecord;
  });

  return { ...recordsParam, records: adjustedRecords };
}
/**
 * フィールド設定に合わせた調整_値の範囲
 * @param value 
 * @param info 
 * @returns 
 */
function adjustTextLength(value: string, info: FieldInfo): string {
  const minLength = parseInt(info.minLength || '0');
  const maxLength = parseInt(info.maxLength || '9223372036854775807');

  if (value.length > maxLength) {
    // 最大を超えている場合はカット
    return value.substring(0, maxLength);
  }
  if (value.length < minLength) {
    // 最小に届かない場合は「X」で補填
    return value.padEnd(minLength, 'X');
  }
  return value;
}
/**
 * フィールド設定に合わせた調整_値の上限・下限
 * @param value 
 * @param info 
 * @returns 
 */
function adjustNumber(value: string, info: FieldInfo): string {
  let num = parseFloat(value);
  const min = info.minValue ? parseFloat(info.minValue) : -Infinity;
  const max = info.maxValue ? parseFloat(info.maxValue) : Infinity;

  num = Math.max(min, Math.min(max, num));
  return num.toString();
}


/**
 * unique設定されているフィールド一覧の抽出
 * @param data 
 * @returns 
 */
function extractUniqueKeys(data: FieldInfo): string[] {
  const uniqueKeys: string[] = [];

  for (const [key, field] of Object.entries(data)) {
    if (field.unique === true) {
      uniqueKeys.push(key);
    }
  }

  return uniqueKeys;
}


/**
 * 必須項目設定されているフィールドの値を取得
 * @param appId 
 * @param fields 
 * @param isGuestSpace 
 * @returns 
 */
async function getUniqueData(appId: number, fields: string[], isGuestSpace: boolean) {
  const records = await kintoneGetRecords(appId, fields, isGuestSpace);
  return transformData(records);
}


/**
 * 複数のレコードを取得する(kintone REST API)
 * @param appId 
 * @param records 
 */
async function kintoneGetRecords(appId: number, fields: string[], isGuestSpace: boolean) {
  const body = {
    app: appId,
    fields: fields,
  };
  const response = await kintone.api(
    kintone.api.url("/k/v1/records.json", isGuestSpace),
    "GET",
    body,
  ).catch((e: KintoneRestAPiError) => {
    throw e
  }) as KintoneGetRecords;
  return response.records
}

/**
 * kintoneから取得したレコード値の形式を変換
 * @param records 
 * @returns 
 */
function transformData(records: KintoneRecords[]): UniqueData {
  const result: { [key: string]: string[] } = {};

  records.forEach(record => {
    Object.keys(record).forEach(key => {
      const value = record[key].value;
      if (!result[key]) {
        result[key] = [];
      }
      if (value) result[key].push(value);
    });
  });

  return result;
}

