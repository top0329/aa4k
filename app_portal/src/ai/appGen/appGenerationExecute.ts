import { setPrompt, executeLlm } from "../common"
import {
  AppGenerationExecuteResponse,
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
import { KintoneError } from "~/util/customErrors"


interface LlmContext {
  userId: string;
  conversationId: string;
  sessionId: string;
}
interface KintoneFieldAddProperties {
  [key: string]: string;
}


/**
 * AI機能_アプリ作成の実行
 * @param conversation 
 * @returns AppGenerationExecuteResponse
 */
export const appGenerationExecute = async (conversation: AppGenerationExecuteConversation): Promise<AppGenerationExecuteResponse> => {
  const { message } = conversation;
  const context = conversation.context as AppGenerationExecuteContext;
  const isGuestSpace = context.isGuestSpace;
  const sessionId = context.sessionId;

  const { promptInfoList } = context;
  try {
    // --------------------
    // 前処理
    // --------------------
    const promptInfo = await setPrompt([ServiceDiv.app_gen_field, ServiceDiv.app_gen_field_retry, ServiceDiv.app_gen_layout], promptInfoList)
    //     const promptInfo = [
    //       {
    //         service_div: "app_gen_field",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // フィールド名とタイプを与えるので、kintone アプリのフィールドを追加する API リクエストを作成してください。

    // アプリ名は {appName} です。
    // フィールド名とタイプは以下のとおりです。
    // {fieldList}

    // 出力は以下のような形式になります。
    // {{
    //   "responseMessage": "メッセージ",
    //   "fields": {{
    //     "文字列1行": {{
    //       "type": "SINGLE_LINE_TEXT",
    //       "code": "文字列1行",
    //       "label": "文字列 (1行)",
    //       "noLabel": false,
    //       "required": false,
    //       "minLength": "",
    //       "maxLength": "",
    //       "expression": "",
    //       "hideExpression": false,
    //       "unique": false,
    //       "defaultValue": ""
    //     }},
    //     "リッチエディター": {{
    //       "type": "RICH_TEXT",
    //       "code": "リッチエディター",
    //       "label": "リッチエディター",
    //       "noLabel": false,
    //       "required": false,
    //       "defaultValue": ""
    //     }},
    //     "文字列複数行": {{
    //       "type": "MULTI_LINE_TEXT",
    //       "code": "文字列複数行",
    //       "label": "文字列 (複数行)",
    //       "noLabel": false,
    //       "required": false,
    //       "defaultValue": ""
    //     }},
    //     "数値": {{
    //       "type": "NUMBER",
    //       "code": "数値",
    //       "label": "数値",
    //       "noLabel": false,
    //       "required": false,
    //       "minValue": "",
    //       "maxValue": "",
    //       "digit": false,
    //       "unique": false,
    //       "defaultValue": "",
    //       "displayScale": "",
    //       "unit": "",
    //       "unitPosition": "BEFORE"
    //     }},
    //     "計算": {{
    //       "type": "CALC",
    //       "code": "計算",
    //       "label": "計算",
    //       "noLabel": false,
    //       "required": false,
    //       "expression": "数値",
    //       "format": "NUMBER",
    //       "displayScale": "",
    //       "hideExpression": false,
    //       "unit": "",
    //       "unitPosition": "BEFORE"
    //     }},
    //     "ラジオボタン": {{
    //       "type": "RADIO_BUTTON",
    //       "code": "ラジオボタン",
    //       "label": "ラジオボタン",
    //       "noLabel": false,
    //       "required": true,
    //       "options": {{
    //         "sample1": {{
    //           "label": "sample1",
    //           "index": "0"
    //         }},
    //         "sample2": {{
    //           "label": "sample2",
    //           "index": "1"
    //         }}
    //       }},
    //       "defaultValue": "sample1",
    //       "align": "HORIZONTAL"
    //     }},
    //     "チェックボックス": {{
    //       "type": "CHECK_BOX",
    //       "code": "チェックボックス",
    //       "label": "チェックボックス",
    //       "noLabel": false,
    //       "required": false,
    //       "options": {{
    //         "sample1": {{
    //           "label": "sample1",
    //           "index": "0"
    //         }},
    //         "sample2": {{
    //           "label": "sample2",
    //           "index": "1"
    //         }}
    //       }},
    //       "defaultValue": [],
    //       "align": "HORIZONTAL"
    //     }},
    //     "複数選択": {{
    //       "type": "MULTI_SELECT",
    //       "code": "複数選択",
    //       "label": "複数選択",
    //       "noLabel": false,
    //       "required": false,
    //       "options": {{
    //         "sample1": {{
    //           "label": "sample1",
    //           "index": "0"
    //         }},
    //         "sample2": {{
    //           "label": "sample2",
    //           "index": "1"
    //         }},
    //         "sample3": {{
    //           "label": "sample3",
    //           "index": "2"
    //         }},
    //         "sample4": {{
    //           "label": "sample4",
    //           "index": "3"
    //         }}
    //       }},
    //       "defaultValue": []
    //     }},
    //     "ドロップダウン": {{
    //       "type": "DROP_DOWN",
    //       "code": "ドロップダウン",
    //       "label": "ドロップダウン",
    //       "noLabel": false,
    //       "required": false,
    //       "options": {{
    //         "sample1": {{
    //           "label": "sample1",
    //           "index": "0"
    //         }},
    //         "sample2": {{
    //           "label": "sample2",
    //           "index": "1"
    //         }}
    //       }},
    //       "defaultValue": ""
    //     }},
    //     "日付": {{
    //       "type": "DATE",
    //       "code": "日付",
    //       "label": "日付",
    //       "noLabel": false,
    //       "required": false,
    //       "unique": false,
    //       "defaultValue": "",
    //       "defaultNowValue": true
    //     }},
    //     "時刻": {{
    //       "type": "TIME",
    //       "code": "時刻",
    //       "label": "時刻",
    //       "noLabel": false,
    //       "required": false,
    //       "defaultValue": "",
    //       "defaultNowValue": true
    //     }},
    //     "日時": {{
    //       "type": "DATETIME",
    //       "code": "日時",
    //       "label": "日時",
    //       "noLabel": false,
    //       "required": false,
    //       "unique": false,
    //       "defaultValue": "",
    //       "defaultNowValue": true
    //     }},
    //     "添付ファイル": {{
    //       "type": "FILE",
    //       "code": "添付ファイル",
    //       "label": "添付ファイル",
    //       "noLabel": false,
    //       "required": false,
    //       "thumbnailSize": "150"
    //     }},
    //     "リンク": {{
    //       "type": "LINK",
    //       "code": "リンク",
    //       "label": "リンク",
    //       "noLabel": false,
    //       "required": false,
    //       "protocol": "WEB",
    //       "minLength": "",
    //       "maxLength": "",
    //       "unique": false,
    //       "defaultValue": ""
    //     }},
    //     "ユーザー選択": {{
    //       "type": "USER_SELECT",
    //       "code": "ユーザー選択",
    //       "label": "ユーザー選択",
    //       "noLabel": false,
    //       "required": false,
    //       "entities": [],
    //       "defaultValue": []
    //     }},
    //     "組織選択": {{
    //       "type": "ORGANIZATION_SELECT",
    //       "code": "組織選択",
    //       "label": "組織選択",
    //       "noLabel": false,
    //       "required": false,
    //       "entities": [],
    //       "defaultValue": []
    //     }},
    //     "グループ選択": {{
    //       "type": "GROUP_SELECT",
    //       "code": "グループ選択",
    //       "label": "グループ選択",
    //       "noLabel": false,
    //       "required": false,
    //       "entities": [],
    //       "defaultValue": []
    //     }},
    //     "グループ": {{
    //       "type": "GROUP",
    //       "code": "グループ",
    //       "label": "グループ",
    //       "noLabel": false,
    //       "openGroup": false
    //     }},
    //     "Table": {{
    //       "type": "SUBTABLE",
    //       "code": "Table",
    //       "label": "Table",
    //       "noLabel": false,
    //       "fields": {{
    //         "文字列1行": {{
    //           "type": "SINGLE_LINE_TEXT",
    //           "code": "文字列1行",
    //           "label": "文字列 (1行)",
    //           "noLabel": false,
    //           "required": false,
    //           "minLength": "",
    //           "maxLength": "",
    //           "expression": "",
    //           "hideExpression": false,
    //           "unique": false,
    //           "defaultValue": ""
    //         }}
    //       }}
    //     }}
    //   }}
    // }}
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
    //             item_name: "fields",
    //             item_type: "object",
    //             item_describe: "フィールドの情報",
    //             constants: "null",
    //           }
    //         ],
    //       },
    //       {
    //         service_div: "app_gen_layout",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // kintone アプリのフィールド一覧を与えるので、適切なレイアウトを構成してください。
    // 新規にフィールドは作成せず、既に定義されているフィールドのみでレイアウトを構成してください。
    // 出力はフォームのレイアウトを変更する API に沿った形とします。

    // フィールド一覧は以下のとおりです。
    // {fields}
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
    //             item_name: "layout",
    //             item_type: "array",
    //             item_describe: "フォームのレイアウト",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 3,
    //             parent_item_id: 2,
    //             item_name: "-",
    //             item_type: "object",
    //             item_describe: "フォームのレイアウト",
    //             constants: "null",
    //           },
    //         ],
    //       },
    //       {
    //         service_div: "app_gen_field_retry",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // kintone アプリのフィールドを追加する API を叩いたときにエラーが発生したので、エラーを解消してもう一度 API を叩くために必要な JSON を出力してください。

    // API を叩いた時に用いたフィールドは以下のとおりです。
    // {fieldParam}

    // エラーレスポンスは以下のようになりました。
    // {errorInfo}

    // 出力は以下のような形式になります。
    // {{
    //   "responseMessage": "メッセージ",
    //   "fields": {{
    //     "文字列1行": {{
    //       "type": "SINGLE_LINE_TEXT",
    //       "code": "文字列1行",
    //       "label": "文字列 (1行)",
    //       "noLabel": false,
    //       "required": false,
    //       "minLength": "",
    //       "maxLength": "",
    //       "expression": "",
    //       "hideExpression": false,
    //       "unique": false,
    //       "defaultValue": ""
    //     }},
    //     "リッチエディター": {{
    //       "type": "RICH_TEXT",
    //       "code": "リッチエディター",
    //       "label": "リッチエディター",
    //       "noLabel": false,
    //       "required": false,
    //       "defaultValue": ""
    //     }},
    //     "文字列複数行": {{
    //       "type": "MULTI_LINE_TEXT",
    //       "code": "文字列複数行",
    //       "label": "文字列 (複数行)",
    //       "noLabel": false,
    //       "required": false,
    //       "defaultValue": ""
    //     }},
    //     "数値": {{
    //       "type": "NUMBER",
    //       "code": "数値",
    //       "label": "数値",
    //       "noLabel": false,
    //       "required": false,
    //       "minValue": "",
    //       "maxValue": "",
    //       "digit": false,
    //       "unique": false,
    //       "defaultValue": "",
    //       "displayScale": "",
    //       "unit": "",
    //       "unitPosition": "BEFORE"
    //     }},
    //     "計算": {{
    //       "type": "CALC",
    //       "code": "計算",
    //       "label": "計算",
    //       "noLabel": false,
    //       "required": false,
    //       "expression": "数値",
    //       "format": "NUMBER",
    //       "displayScale": "",
    //       "hideExpression": false,
    //       "unit": "",
    //       "unitPosition": "BEFORE"
    //     }},
    //     "ラジオボタン": {{
    //       "type": "RADIO_BUTTON",
    //       "code": "ラジオボタン",
    //       "label": "ラジオボタン",
    //       "noLabel": false,
    //       "required": true,
    //       "options": {{
    //         "sample1": {{
    //           "label": "sample1",
    //           "index": "0"
    //         }},
    //         "sample2": {{
    //           "label": "sample2",
    //           "index": "1"
    //         }}
    //       }},
    //       "defaultValue": "sample1",
    //       "align": "HORIZONTAL"
    //     }},
    //     "チェックボックス": {{
    //       "type": "CHECK_BOX",
    //       "code": "チェックボックス",
    //       "label": "チェックボックス",
    //       "noLabel": false,
    //       "required": false,
    //       "options": {{
    //         "sample1": {{
    //           "label": "sample1",
    //           "index": "0"
    //         }},
    //         "sample2": {{
    //           "label": "sample2",
    //           "index": "1"
    //         }}
    //       }},
    //       "defaultValue": [],
    //       "align": "HORIZONTAL"
    //     }},
    //     "複数選択": {{
    //       "type": "MULTI_SELECT",
    //       "code": "複数選択",
    //       "label": "複数選択",
    //       "noLabel": false,
    //       "required": false,
    //       "options": {{
    //         "sample1": {{
    //           "label": "sample1",
    //           "index": "0"
    //         }},
    //         "sample2": {{
    //           "label": "sample2",
    //           "index": "1"
    //         }},
    //         "sample3": {{
    //           "label": "sample3",
    //           "index": "2"
    //         }},
    //         "sample4": {{
    //           "label": "sample4",
    //           "index": "3"
    //         }}
    //       }},
    //       "defaultValue": []
    //     }},
    //     "ドロップダウン": {{
    //       "type": "DROP_DOWN",
    //       "code": "ドロップダウン",
    //       "label": "ドロップダウン",
    //       "noLabel": false,
    //       "required": false,
    //       "options": {{
    //         "sample1": {{
    //           "label": "sample1",
    //           "index": "0"
    //         }},
    //         "sample2": {{
    //           "label": "sample2",
    //           "index": "1"
    //         }}
    //       }},
    //       "defaultValue": ""
    //     }},
    //     "日付": {{
    //       "type": "DATE",
    //       "code": "日付",
    //       "label": "日付",
    //       "noLabel": false,
    //       "required": false,
    //       "unique": false,
    //       "defaultValue": "",
    //       "defaultNowValue": true
    //     }},
    //     "時刻": {{
    //       "type": "TIME",
    //       "code": "時刻",
    //       "label": "時刻",
    //       "noLabel": false,
    //       "required": false,
    //       "defaultValue": "",
    //       "defaultNowValue": true
    //     }},
    //     "日時": {{
    //       "type": "DATETIME",
    //       "code": "日時",
    //       "label": "日時",
    //       "noLabel": false,
    //       "required": false,
    //       "unique": false,
    //       "defaultValue": "",
    //       "defaultNowValue": true
    //     }},
    //     "添付ファイル": {{
    //       "type": "FILE",
    //       "code": "添付ファイル",
    //       "label": "添付ファイル",
    //       "noLabel": false,
    //       "required": false,
    //       "thumbnailSize": "150"
    //     }},
    //     "リンク": {{
    //       "type": "LINK",
    //       "code": "リンク",
    //       "label": "リンク",
    //       "noLabel": false,
    //       "required": false,
    //       "protocol": "WEB",
    //       "minLength": "",
    //       "maxLength": "",
    //       "unique": false,
    //       "defaultValue": ""
    //     }},
    //     "ユーザー選択": {{
    //       "type": "USER_SELECT",
    //       "code": "ユーザー選択",
    //       "label": "ユーザー選択",
    //       "noLabel": false,
    //       "required": false,
    //       "entities": [],
    //       "defaultValue": []
    //     }},
    //     "組織選択": {{
    //       "type": "ORGANIZATION_SELECT",
    //       "code": "組織選択",
    //       "label": "組織選択",
    //       "noLabel": false,
    //       "required": false,
    //       "entities": [],
    //       "defaultValue": []
    //     }},
    //     "グループ選択": {{
    //       "type": "GROUP_SELECT",
    //       "code": "グループ選択",
    //       "label": "グループ選択",
    //       "noLabel": false,
    //       "required": false,
    //       "entities": [],
    //       "defaultValue": []
    //     }},
    //     "グループ": {{
    //       "type": "GROUP",
    //       "code": "グループ",
    //       "label": "グループ",
    //       "noLabel": false,
    //       "openGroup": false
    //     }},
    //     "Table": {{
    //       "type": "SUBTABLE",
    //       "code": "Table",
    //       "label": "Table",
    //       "noLabel": false,
    //       "fields": {{
    //         "文字列1行": {{
    //           "type": "SINGLE_LINE_TEXT",
    //           "code": "文字列1行",
    //           "label": "文字列 (1行)",
    //           "noLabel": false,
    //           "required": false,
    //           "minLength": "",
    //           "maxLength": "",
    //           "expression": "",
    //           "hideExpression": false,
    //           "unique": false,
    //           "defaultValue": ""
    //         }}
    //       }}
    //     }}
    //   }}
    // }}
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
    //             item_name: "fields",
    //             item_type: "object",
    //             item_describe: "フィールドの情報",
    //             constants: "null",
    //           }
    //         ],
    //       }
    //     ]

    // LLM連携用のcontext
    const llmContext: LlmContext = { userId: context.userId, conversationId: context.conversationId, sessionId: sessionId }

    // --------------------
    // アプリ作成の実行
    //   ・フィールド追加用パラメータ生成(LLM)
    //   ・アプリ作成の実行(kintone REST API)
    // --------------------
    const appName = context.settingInfo.appName;
    const fieldList = JSON.stringify(context.settingInfo.fields)
    const { appId, fieldsParam } = await executeAppGeneration(message.content, appName, fieldList, context.contractStatus, llmContext, isGuestSpace, promptInfo)

    // --------------------
    // レイアウト用パラメータ生成(LLM)
    // --------------------
    const layoutPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_layout);
    const layoutParam = {
      fields: JSON.stringify(fieldsParam.fields)
    }
    const layoutParamLlmResult = await executeLlm("", [], context.contractStatus, layoutPromptInfo[0], layoutParam, llmContext)


    // --------------------
    // レイアウト変更の実行(kintone REST API)
    // --------------------
    const kintoneFormLayoutBody = {
      app: appId,
      layout: layoutParamLlmResult.layout,
    };
    await kintone.api(
      kintone.api.url("/k/v1/preview/app/form/layout.json", isGuestSpace),
      "PUT",
      kintoneFormLayoutBody,
    ).catch((e: KintoneRestAPiError) => {
      throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`)
    });

    // --------------------
    // kintone 運用環境へのデプロイ(kintone REST API)
    // --------------------
    await kintone.api(
      kintone.api.url("/k/v1/preview/app/deploy.json", isGuestSpace),
      "POST",
      { apps: [{ app: appId }] },
    ).catch((e: KintoneRestAPiError) => {
      throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`)
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
        layoutParam: layoutParamLlmResult.layout
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
  } catch (e) {
    console.log(e)
    return {
      result: "error",
      errorMessage: ErrorMessageConst.E_MSG009
    }
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
 * @returns appId, fieldParam
 */
async function executeAppGeneration(message: string, appName: string, fieldList: string, contractStatus: ContractStatus, llmContext: LlmContext, isGuestSpace: boolean, promptInfo: PromptInfo[]) {
  let maxRetries = 3; // 最大リトライ回数
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
    throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`)
  });
  const appId = kintoneAppResult.app;

  // フィールド追加用パラメータ生成(LLM)の実行
  let fieldsParam = await llmAppGenFieldParam(message, appName, fieldList, contractStatus, llmContext, promptInfo);
  while (retryCount < maxRetries && !success) {
    try {
      if (retryCount !== 0) {
        // フィールド追加用パラメータ生成_リトライ(LLM)の実行
        fieldsParam = await llmAppGenFieldRetryParam(message, appName, contractStatus, llmContext, promptInfo, JSON.stringify(fieldsParam.fields), errorInfo);
      }

      // アプリ作成の実行(kintone REST API)
      await kintoneAppGenFieldAdd(appId, fieldsParam.fields, isGuestSpace);
      success = true;
    } catch (e) {
      // エラーの場合はエラー内容を設定
      errorInfo = JSON.stringify(e);
      retryCount++;
      if (retryCount >= maxRetries) {
        // 最大リトライ回数を超えたらエラー TODO: エラーメッセージ
        throw new Error("最大リトライ回数に達しました。アプリ作成に失敗しました。");  // TODO: エラーメッセージ
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
  return result;
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
async function llmAppGenFieldRetryParam(message: string, appName: string, contractStatus: ContractStatus, llmContext: LlmContext, promptInfo: PromptInfo[], fieldParam: string, errorInfo: string) {
  const prompt = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_field_retry);
  const promptParam = {
    appName: appName,
    fieldParam: fieldParam,
    errorInfo: errorInfo,
  };
  const result = await executeLlm(message, [], contractStatus, prompt[0], promptParam, llmContext)
  return result;
}


/**
 * アプリ作成の実行(kintone REST API)
 * @param appId 
 * @param kintoneFieldAddProperties 
 */
async function kintoneAppGenFieldAdd(appId: string, kintoneFieldAddProperties: KintoneFieldAddProperties, isGuestSpace: boolean) {

  // TODO: kintone固有フィールドの除外 現状では不要だが、テストの結果、必要になったら戻す
  // kintone固有フィールド一覧
  // const kintoneFieldList = ["カテゴリー", "レコード番号", "作業者", "更新者", "作成者", "ステータス", "更新日時", "作成日時"]

  // kintoneFieldAddPropertiesからkintone予約フィールドを削除
  // Object.keys(kintoneFieldAddProperties).forEach(key => {
  //   if (kintoneFieldList.includes(key)) {
  //     delete kintoneFieldAddProperties[key];
  //   }
  // });
  // console.log("  kintoneFieldAddProperties2: ", kintoneFieldAddProperties)



  const kintoneFormFieldsBody = {
    app: appId,
    properties: kintoneFieldAddProperties,
  };
  await kintone.api(
    kintone.api.url("/k/v1/preview/app/form/fields.json", isGuestSpace),
    "POST",
    kintoneFormFieldsBody,
  ).catch((e: KintoneRestAPiError) => {
    throw e
  });
}

