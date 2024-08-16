import { v4 as uuidv4 } from 'uuid';
import { setPrompt, executeLlm, ExecuteLlmContext, PromptParam, } from "../common"
import { ErrorCode, ErrorMessage as ErrorMessageConst, ServiceDiv, ContractStatus, ActionType } from "~/constants"
import { AiResponse, Conversation, MessageType, DataGenContext, kintoneFormFields, PromptInfo } from "../../types/ai";
import { KintoneRestAPiError } from "~/types/apiResponse";

import { LlmError, KintoneError, ContractExpiredError, ContractStatusError } from "~/util/customErrors"

interface KintoneRecord {
  [key: string]: string;
}

/**
 * AI機能_データ生成
 * @param conversation 
 * @returns AiResponse
 */
export const dataGenerationExecute = async (conversation: Conversation, setIsReload: React.Dispatch<React.SetStateAction<boolean>>): Promise<AiResponse> => {
  const { message, } = conversation;
  const context = conversation.context as DataGenContext;
  const { appId, userId, conversationId, contractStatus, pluginId, isGuestSpace, promptInfoList, systemSettings } = context;
  const sessionId = uuidv4();
  const oneDataGenMaxCount = systemSettings.oneDataGenMaxCount;
  const callbackFuncs: Function[] = [];
  try {
    // --------------------
    // 前処理
    // --------------------
    const promptInfo = await setPrompt(pluginId, [ServiceDiv.dat_gen_count, ServiceDiv.dat_gen_record, ServiceDiv.dat_gen_record_retry], promptInfoList)
    //     const promptInfo = [
    //       {
    //         service_div: "dat_gen_count",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // ユーザのメッセージが以下のどのタイプに該当するかを判定して、actionType として出力してください。
    // - 「other」の場合は、ユーザのメッセージへの応答を response として出力してください。
    // - 「unknown」の場合は、「申し訳ありません、よくわかりませんでした。より詳しい表現に変えてお試しください。」を response として出力してください。
    // - 「create」の場合は、作成するダミーデータの件数を number として出力し、作成するダミーデータの条件を condition として出力してください。さらに、ダミーデータの条件と件数を「xxxなデータn件を登録しました」という形式で response として出力してください。
    //     - 特に条件が指定されていない場合は、「ダミーデータ」を条件としてください。

    // タイプ一覧
    // - create: ダミーデータの作成の要望
    // - unknown: kintone アプリに関係するが、「create」に分類するのが難しいメッセージ
    // - other: その他のメッセージ
    // `,
    //         prompt_function_parameter: [
    //           {
    //             item_id: 1,
    //             parent_item_id: null,
    //             item_name: "userMessageType",
    //             item_type: "string",
    //             item_describe: "「create」「unknown」「other」のいずれか",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "createCount",
    //             item_type: "number",
    //             item_describe: "type が「create」の場合の、作成するダミーデータの件数",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 3,
    //             parent_item_id: null,
    //             item_name: "condition",
    //             item_type: "string",
    //             item_describe: "type が「create」の場合の、作成するダミーデータの条件",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 4,
    //             parent_item_id: null,
    //             item_name: "responseMessage",
    //             item_type: "string",
    //             item_describe: "応答するメッセージ",
    //             constants: "null",
    //           },
    //         ],
    //       },
    //       {
    //         service_div: "dat_gen_record",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // フィールドの情報を与えるので、ダミーデータを作成して、kintone アプリの複数のレコードを登録する API リクエストを作成してください。
    // - ダミーデータとして設定する値は、アプリの実際の運用を想定した値にしてください。
    // - minLength や maxLength などフィールドに条件が設定されている場合は厳守してください。
    // - RECORD_NUMBER型、STATUS_ASSIGNEE型のフィールドには値を設定しないでください。
    // - 添付ファイルのフィールドには値を設定しないでください。
    // - 「（作成したデータの内容）を作成しました。」を responseMessage として出力してください。
    //     - （作成したデータの内容）にはユーザの要望からどのようなデータを作成したかを代入してください。

    // フィールドの情報は以下のとおりです。
    // {fields}

    // 作成するダミーデータの件数は {createCount} 件です。

    // 作成するダミーデータについてユーザが希望する条件が存在する場合、ユーザが希望する条件は以下のとおりです。
    // {condition}

    // 出力は以下のような形式になります。
    // {{
    //   "responseMessage": "メッセージ",
    //   "records": [
    //     {{
    //       "文字列1行": {{
    //         "value": "ABC"
    //       }},
    //       "テーブル": {{
    //         "value": [
    //           {{
    //             "value": {{
    //               "文字列1行_0": {{
    //                 "value": "サンプル１"
    //               }},
    //               "数値": {{
    //                 "value": "1"
    //               }},
    //               "チェックボックス": {{
    //                 "value": ["選択肢1"]
    //               }}
    //             }}
    //           }}
    //         ]
    //       }}
    //     }}
    //   ]
    // }}
    // `,
    //         prompt_function_parameter: [
    //           {
    //             item_id: 1,
    //             parent_item_id: null,
    //             item_name: "responseMessage",
    //             item_type: "string",
    //             item_describe: "どのようなデータを作成したかをユーザに応答するためのメッセージ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "records",
    //             item_type: "array",
    //             item_describe: "登録するダミーデータ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 3,
    //             parent_item_id: 2,
    //             item_name: "-",
    //             item_type: "object",
    //             item_describe: "登録するダミーデータ",
    //             constants: "null",
    //           },
    //         ],
    //       },
    //       {
    //         service_div: "dat_gen_record_retry",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // kintone アプリの複数のレコードを登録する API を叩いたときにエラーが発生したので、エラーを解消してもう一度 API を叩くために必要な JSON を出力してください。
    // - 「（作成したデータの内容）を作成しました。」を responseMessage として出力してください。
    //     - （作成したデータの内容）にはユーザの要望からどのようなデータを作成したかを代入してください。

    // フィールドの情報は以下のとおりです。
    // {fields}

    // API を叩いた時に用いたレコードは以下のとおりです。
    // {records}

    // エラーレスポンスは以下のようになりました。
    // {errorInfo}
    // `,
    //         prompt_function_parameter: [
    //           {
    //             item_id: 1,
    //             parent_item_id: null,
    //             item_name: "responseMessage",
    //             item_type: "string",
    //             item_describe: "応答するメッセージ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "records",
    //             item_type: "array",
    //             item_describe: "登録するダミーデータ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 3,
    //             parent_item_id: 2,
    //             item_name: "-",
    //             item_type: "object",
    //             item_describe: "登録するダミーデータ",
    //             constants: "null",
    //           },
    //         ],
    //       },



    //       {
    //         service_div: "dat_gen_count_bk",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // ユーザからアプリ作成の要望がある場合
    // - ユーザのメッセージに作成するべき件数がある場合は、createCount として出力してください。
    //     - 作成する件数に関するメッセージが存在しない場合は、「作成する件数を教えてください」を responseMessage として出力してください。
    // - ユーザのメッセージから作成すべき内容を createContents として出力してください。
    //     - ただし、件数に関する情報はここには含めないでください。
    // `,
    //         prompt_function_parameter: [
    //           {
    //             item_id: 1,
    //             parent_item_id: null,
    //             item_name: "createCount",
    //             item_type: "number",
    //             item_describe: "作成する件数",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "createContents",
    //             item_type: "string",
    //             item_describe: "作成する内容",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 3,
    //             parent_item_id: null,
    //             item_name: "responseMessage",
    //             item_type: "string",
    //             item_describe: "作成する件数に関するメッセージが存在しない場合に、応答するメッセージ",
    //             constants: "null",
    //           },
    //         ],
    //       },
    //       {
    //         service_div: "dat_gen_record_bk",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // フィールドの情報を与えるので、ダミーデータを作成して、kintone アプリの複数のレコードを登録する API リクエストを作成してください。
    // - ダミーデータとして設定する値は、アプリの実際の運用を想定した値にしてください。
    // - minLength や maxLength などフィールドに条件が設定されている場合は厳守してください。
    // - RECORD_ID型、STATUS_ASSIGNEE型、USER_SELECT型のフィールドには値を設定しないでください。
    // - 添付ファイルのフィールドには値を設定しないでください。
    // - 「（作成したデータの内容）を作成しました。」を responseMessage として出力してください。
    //     - （作成したデータの内容）にはユーザの要望からどのようなデータを作成したかを代入してください。

    // フィールドの情報は以下のとおりです。
    // {fields}

    // 作成する件数は {createCount} 件です。
    // `,
    //         prompt_function_parameter: [
    //           {
    //             item_id: 1,
    //             parent_item_id: null,
    //             item_name: "responseMessage",
    //             item_type: "string",
    //             item_describe: "どのようなデータを作成したかをユーザに応答するためのメッセージ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "records",
    //             item_type: "array",
    //             item_describe: "登録するダミーデータ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 3,
    //             parent_item_id: 2,
    //             item_name: "-",
    //             item_type: "object",
    //             item_describe: "登録するダミーデータ",
    //             constants: "null",
    //           },
    //         ],
    //       },
    //       {
    //         service_div: "dat_gen_record_retry_bk",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // kintone アプリの複数のレコードを登録する API を叩いたときにエラーが発生したので、エラーを解消してもう一度 API を叩くために必要な JSON を出力してください。
    // - 「（作成したデータの内容）を作成しました。」を responseMessage として出力してください。
    //     - （作成したデータの内容）にはユーザの要望からどのようなデータを作成したかを代入してください。

    // フィールドの情報は以下のとおりです。
    // {fields}

    // API を叩いた時に用いたレコードは以下のとおりです。
    // {records}

    // エラーレスポンスは以下のようになりました。
    // {errorInfo}

    // 作成する件数は {createCount} 件です。
    // `,
    //         prompt_function_parameter: [
    //           {
    //             item_id: 1,
    //             parent_item_id: null,
    //             item_name: "responseMessage",
    //             item_type: "string",
    //             item_describe: "応答するメッセージ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "records",
    //             item_type: "array",
    //             item_describe: "登録するダミーデータ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 3,
    //             parent_item_id: 2,
    //             item_name: "-",
    //             item_type: "object",
    //             item_describe: "登録するダミーデータ",
    //             constants: "null",
    //           },
    //         ],
    //       },
    //     ]

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
    // 件数抽出(LLM)
    // --------------------
    const llmContext = { userId: userId, appId: appId, conversationId: conversationId, sessionId: sessionId }
    const countPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.dat_gen_count);
    const countLlmResult = await executeLlm(message.content, [], contractStatus, countPromptInfo[0], {}, llmContext, pluginId)

    // 結果を格納
    const actionType: string = countLlmResult.actionType;
    const createCount: number = countLlmResult.createCount;
    const condition: string = countLlmResult.condition;
    const responseMessage: string = countLlmResult.responseMessage;
    let generatedData = "";

    // レコード追加判定(件数が0件の場合、または、タイプが「作成」以外はfalse)
    const isAddRecords = (createCount > 0 || actionType === ActionType.create);
    if (isAddRecords) {
      // --------------------
      // レコード追加処理
      // --------------------
      const resultAddRecord = await executeAddRecordsParallel(condition, createCount, oneDataGenMaxCount, appId, JSON.stringify(fieldInfo), contractStatus, pluginId, llmContext, promptInfo, isGuestSpace)
      generatedData = JSON.stringify(resultAddRecord.records);
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
  oneCreateCount: number,
  appId: number,
  fieldInfo: string,
  contractStatus: ContractStatus,
  pluginId: string,
  llmContext: ExecuteLlmContext,
  promptInfo: PromptInfo[],
  isGuestSpace: boolean
) {
  // 1回で作成する件数の最大値
  const MAX_CREATE_COUNT = oneCreateCount;

  // 並列実行数の算出
  const parallel = processCounts(createCount, MAX_CREATE_COUNT)

  // 並列実行する関数配列を準備
  const llmPromises = parallel.map((count) => {
    return executeAddRecords(message, count, appId, fieldInfo, contractStatus, pluginId, llmContext, promptInfo, isGuestSpace)
  });

  // llmRecordsを並列実行
  const result = await Promise.all(llmPromises);

  // 並列実行した結果を設定
  const responseMessage = result[0].responseMessage;
  const records = result.map(item => item.records);

  // 結果を返却
  return { responseMessage: responseMessage, records: records };
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
  isGuestSpace: boolean
) {
  let maxRetries = 5; // 最大リトライ回数
  let retryCount = 0;
  let success = false;
  let errorInfo = "";

  // プロンプトの設定
  const recordPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.dat_gen_record);
  // プロンプトへ渡すパラメータ
  const promptParam = { fields: fieldInfo, createCount: createCount, condition: message };

  // [LLM] レコード追加用パラメータ生成
  let recordsParam = await llmRecords(contractStatus, pluginId, llmContext, recordPromptInfo[0], promptParam);

  // リトライ用ループ
  while (retryCount < maxRetries && !success) {
    try {
      // 初回は無視
      if (retryCount !== 0) {
        // フィールド追加用パラメータ生成_リトライ(LLM)の実行

        // プロンプトの設定
        const recordPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.dat_gen_record_retry);
        // プロンプトへ渡すパラメータ
        const promptParam = { fields: fieldInfo, records: JSON.stringify(recordsParam.records), errorInfo: errorInfo };
        // [LLM] レコード追加用パラメータ生成_リトライ
        recordsParam = await llmRecords(contractStatus, pluginId, llmContext, recordPromptInfo[0], promptParam);
      }

      // レコード追加の実行(kintone REST API)
      await kintoneRecords(appId, recordsParam.records, isGuestSpace);
      success = true;
    } catch (e) {
      // エラーの場合はエラー内容を設定
      errorInfo = JSON.stringify(e);
      retryCount++;
      if (retryCount >= maxRetries) {
        // 最大リトライ回数を超えたらエラー TODO: エラーメッセージ
        throw new Error("最大リトライ回数に達しました。データ作成に失敗しました。");  // TODO: エラーメッセージ
      }
    }
  }

  // 結果を返却
  return { responseMessage: recordsParam.responseMessage, records: recordsParam.records };
}



/**
 * フィールド追加用パラメータ生成(LLM)
 * @returns result
 */
async function llmRecords(contractStatus: ContractStatus, pluginId: string, llmContext: ExecuteLlmContext, prompt: PromptInfo, promptParam: PromptParam) {
  // 一貫したデータではなく、ランダムなデータを生成してほしいため、[temperature=0] [seed=未設定] を設定して実行
  const result = await executeLlm("", [], contractStatus, prompt, promptParam, llmContext, pluginId, 1, {})
  return result;
}


/**
 * レコード追加の実行(kintone REST API)
 * @param appId 
 * @param records 
 */
async function kintoneRecords(appId: number, records: KintoneRecord[], isGuestSpace: boolean) {

  const kintoneFormLayoutBody = {
    app: appId,
    records: records,
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
 * 作成する件数から並列実行する数を算出する
 * @param createCount 
 * @param oneCount 
 * @returns 
 */
function processCounts(createCount: number, oneCount: number): number[] {
  const fullChunks = Math.floor(createCount / oneCount);
  const remainder = createCount % oneCount;
  const result = Array(fullChunks).fill(oneCount);
  if (remainder > 0) {
    result.push(remainder);
  }
  return result;
}
