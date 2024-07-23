import { AIMessage, BaseMessage, HumanMessage } from "langchain/schema"

import { v4 as uuidv4 } from 'uuid';

import { setPrompt, executeLlm } from "../common"
import {
  AppGenerationPlanningResponse,
  AppGenerationPlanningConversation,
  ChatHistory,
  AppGenerationPlanningContext,
  Field,
} from "~/types";
import { InsertConversationRequest } from "~/types/apiInterfaces"
import { MessageType, ActionType, ServiceDiv, ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants"
import { insertConversation } from "~/util/insertConversationHistory"
import { LlmError, ApiError } from "~/util/customErrors"



/**
 * AI機能_アプリ作成のプランニング
 * @param conversation 
 * @returns AppGenerationPlanningResponse
 */
export const appGenerationPlanning = async (conversation: AppGenerationPlanningConversation): Promise<AppGenerationPlanningResponse> => {
  const { message, chatHistory = [] } = conversation; // デフォルト値としてchatHistory = []を設定
  const context = conversation.context as AppGenerationPlanningContext;
  const { promptInfoList } = context;
  let sessionId = context.sessionId;
  let isCreating = context.isCreating ? context.isCreating : false;
  try {
    // --------------------
    // 前処理
    // --------------------
    const histories = setChatHistory(chatHistory)
    const promptInfo = await setPrompt([ServiceDiv.app_gen_type, ServiceDiv.app_gen_create_field, ServiceDiv.app_gen_edit_field], promptInfoList)
    //     const promptInfo = [
    //       {
    //         service_div: "app_gen_type",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // ユーザのメッセージが以下のどのタイプに該当するかを判定して、userMessageType として出力してください。
    // - 「other」の場合は、ユーザのメッセージへの応答を response として出力してください。
    // - 「unknown」の場合は、「申し訳ありません、よくわかりませんでした。より詳しい表現に変えてお試しください。」を response として出力してください。
    // - その他のタイプの場合は、userMessageType のみを出力してください。

    // タイプ一覧
    // - create: kintone アプリの新規作成の要望
    // - edit: kintone アプリの編集の要望
    // - duplicate: kintone アプリの複製の要望
    // - unknown: kintone アプリに関係するが、「create」「edit」「duplicate」のいずれかに分類するのが難しいメッセージ
    // - other: その他のメッセージ
    // `,
    //         prompt_function_parameter: [
    //           {
    //             item_id: 1,
    //             parent_item_id: null,
    //             item_name: "userMessageType",
    //             item_type: "string",
    //             item_describe: "「create」「edit」「duplicate」「unknown」「other」のいずれか",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "response",
    //             item_type: "string",
    //             item_describe: "type が「unknown」または「other」の場合に、応答するメッセージ",
    //             constants: "null",
    //           }
    //         ],
    //       },
    //       {
    //         service_div: "app_gen_create_field",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // ユーザからアプリ作成の要望がある場合
    // - アプリに必要なフィールドの情報を fields として出力してください。
    //     - fields は 8項目以上10項目以下で提案してください。
    // - アプリ名を applicationName として出力してください。
    // - 「以下の内容でよろしければ「アプリを作成する」をクリックしてください。\nまた、アプリ名やフィールドの変更をする場合はお知らせください。」を responseMessage として出力してください。

    // 出力は以下のような形式になります。
    // {{
    //   "responseMessage": "メッセージ",
    //   "applicationName": "アプリ名",
    //   "fields": [
    //     {{
    //       "type": "SINGLE_LINE_TEXT",
    //       "label": "文字列 (1行)",
    //     }},
    //     {{
    //       "type": "RICH_TEXT",
    //       "label": "リッチエディター",
    //     }},
    //     {{
    //       "type": "MULTI_LINE_TEXT",
    //       "label": "文字列 (複数行)",
    //     }},
    //     {{
    //       "type": "NUMBER",
    //       "label": "数値",
    //     }},
    //     {{
    //       "type": "CALC",
    //       "label": "計算",
    //     }},
    //     {{
    //       "type": "RADIO_BUTTON",
    //       "label": "ラジオボタン",
    //     }},
    //     {{
    //       "type": "CHECK_BOX",
    //       "label": "チェックボックス",
    //     }},
    //     {{
    //       "type": "MULTI_SELECT",
    //       "label": "複数選択",
    //     }},
    //     {{
    //       "type": "DROP_DOWN",
    //       "label": "ドロップダウン",
    //     }},
    //     {{
    //       "type": "DATE",
    //       "label": "日付",
    //     }},
    //     {{
    //       "type": "TIME",
    //       "label": "時刻",
    //     }},
    //     {{
    //       "type": "DATETIME",
    //       "label": "日時",
    //     }},
    //     {{
    //       "type": "FILE",
    //       "label": "添付ファイル",
    //     }},
    //     {{
    //       "type": "LINK",
    //       "label": "リンク",
    //     }},
    //     {{
    //       "type": "USER_SELECT",
    //       "label": "ユーザー選択",
    //     }},
    //     {{
    //       "type": "ORGANIZATION_SELECT",
    //       "label": "組織選択",
    //     }},
    //     {{
    //       "type": "GROUP_SELECT",
    //       "label": "グループ選択",
    //     }},
    //     {{
    //       "type": "GROUP",
    //       "label": "グループ",
    //     }},
    //     {{
    //       "type": "SUBTABLE",
    //       "label": "テーブル",
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
    //             item_describe: "応答するメッセージ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "applicationName",
    //             item_type: "string",
    //             item_describe: "アプリ名",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 3,
    //             parent_item_id: null,
    //             item_name: "fields",
    //             item_type: "array",
    //             item_describe: "代表するフィールドの一覧",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 4,
    //             parent_item_id: 3,
    //             item_name: "-",
    //             item_type: "object",
    //             item_describe: "フィールド",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 5,
    //             parent_item_id: 4,
    //             item_name: "label",
    //             item_type: "string",
    //             item_describe: "フィールド名",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 6,
    //             parent_item_id: 4,
    //             item_name: "type",
    //             item_type: "string",
    //             item_describe: "フィールドの種類",
    //             constants: "null",
    //           }
    //         ],
    //       },
    //       {
    //         service_div: "app_gen_edit_field",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // ユーザからフィールドの追加・更新・削除の要望があれば、要望を反映したフィールドの情報を fields として出力してください。
    // - 追加・更新のあったフィールドを先頭に並べてください。
    // - 「以下の内容でよろしければ「アプリを作成する」をクリックしてください。\nまた、アプリ名やフィールドの変更をする場合はお知らせください。」を response として出力してください。

    // アプリ名は {applicationName} です。
    // 現在のフィールドは以下のとおりです。
    // {settingInfo}

    // 出力は以下のような形式になります。
    // {{
    //   "responseMessage": "メッセージ",
    //   "applicationName": "アプリ名",
    //   "fields": [
    //     {{
    //       "type": "SINGLE_LINE_TEXT",
    //       "label": "文字列 (1行)",
    //     }},
    //     {{
    //       "type": "RICH_TEXT",
    //       "label": "リッチエディター",
    //     }},
    //     {{
    //       "type": "MULTI_LINE_TEXT",
    //       "label": "文字列 (複数行)",
    //     }},
    //     {{
    //       "type": "NUMBER",
    //       "label": "数値",
    //     }},
    //     {{
    //       "type": "CALC",
    //       "label": "計算",
    //     }},
    //     {{
    //       "type": "RADIO_BUTTON",
    //       "label": "ラジオボタン",
    //     }},
    //     {{
    //       "type": "CHECK_BOX",
    //       "label": "チェックボックス",
    //     }},
    //     {{
    //       "type": "MULTI_SELECT",
    //       "label": "複数選択",
    //     }},
    //     {{
    //       "type": "DROP_DOWN",
    //       "label": "ドロップダウン",
    //     }},
    //     {{
    //       "type": "DATE",
    //       "label": "日付",
    //     }},
    //     {{
    //       "type": "TIME",
    //       "label": "時刻",
    //     }},
    //     {{
    //       "type": "DATETIME",
    //       "label": "日時",
    //     }},
    //     {{
    //       "type": "FILE",
    //       "label": "添付ファイル",
    //     }},
    //     {{
    //       "type": "LINK",
    //       "label": "リンク",
    //     }},
    //     {{
    //       "type": "USER_SELECT",
    //       "label": "ユーザー選択",
    //     }},
    //     {{
    //       "type": "ORGANIZATION_SELECT",
    //       "label": "組織選択",
    //     }},
    //     {{
    //       "type": "GROUP_SELECT",
    //       "label": "グループ選択",
    //     }},
    //     {{
    //       "type": "GROUP",
    //       "label": "グループ",
    //     }},
    //     {{
    //       "type": "SUBTABLE",
    //       "label": "テーブル",
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
    //             item_describe: "応答するメッセージ",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "applicationName",
    //             item_type: "string",
    //             item_describe: "アプリ名",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 3,
    //             parent_item_id: null,
    //             item_name: "fields",
    //             item_type: "array",
    //             item_describe: "代表するフィールドの一覧",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 4,
    //             parent_item_id: 3,
    //             item_name: "-",
    //             item_type: "object",
    //             item_describe: "フィールド",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 5,
    //             parent_item_id: 4,
    //             item_name: "label",
    //             item_type: "string",
    //             item_describe: "フィールド名",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 6,
    //             parent_item_id: 4,
    //             item_name: "type",
    //             item_type: "string",
    //             item_describe: "フィールドの種類",
    //             constants: "null",
    //           }
    //         ],
    //       }
    //     ]




    // --------------------
    // タイプ判定（LLM）
    // --------------------
    const llmContext = { userId: context.userId, conversationId: context.conversationId, sessionId: sessionId }
    const typePromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_type);
    const typeLlmResult = await executeLlm(message.content, histories, context.contractStatus, typePromptInfo[0], {}, llmContext)

    // --------------------
    // 作成・編集 の処理
    // --------------------
    if (typeLlmResult.userMessageType === ActionType.create || typeLlmResult.userMessageType === ActionType.edit) {
      if (typeLlmResult.userMessageType === ActionType.create) {
        if (isCreating) {
          // 作成中にタイプが「作成」の場合は、「作成」→「作成」とみなし、セッションIDを再採番する
          sessionId = uuidv4();
        }
        isCreating = true;
      }

      // --------------------
      // アプリ名・フィールド一覧の生成
      // --------------------
      let LlmResult;
      if (typeLlmResult.userMessageType === ActionType.create) {
        // 作成の場合
        const createFieldPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_create_field)
        const settingInfoLlmResult = await executeLlm(message.content, histories, context.contractStatus, createFieldPromptInfo[0], {}, llmContext)
        LlmResult = settingInfoLlmResult;
      } else {
        // 編集の場合
        const editFieldPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_edit_field)
        const editFieldLlmResult = await executeLlm(message.content, histories, context.contractStatus, editFieldPromptInfo[0], { applicationName: context.settingInfo.appName, settingInfo: JSON.stringify(context.settingInfo.fields) }, llmContext)
        LlmResult = editFieldLlmResult;
      }

      // kintone固有フィールドの対応
      const kintoneFieldList = ["レコード番号", "レコードID", "リビジョン", "ステータス", "カテゴリー", "作業者", "作成日時", "更新日時", "作成者", "更新者"]
      const filteredFields: Field[] = [];
      const excludedLabels: string[] = [];

      LlmResult.fields.forEach((field: Field) => {
        if (kintoneFieldList.includes(field.label)) {
          excludedLabels.push(field.label);
        } else {
          filteredFields.push(field);
        }
      });

      // kintone固有フィールドがあった場合、ユーザに表示するメッセージにその旨を追記
      const addMessage = excludedLabels.length ? `${excludedLabels.join("、")}はkintoneの固定フィールドのため指定できません。\n\n` : "";
      const resultMessage = `${addMessage}${LlmResult.responseMessage}`

      // 結果回答詳細
      const fieldLabels = filteredFields.slice(0, 10).map((field: Field) => field.label);
      const messageDetail = `アプリ名：\n${LlmResult.applicationName}\n\n代表的なフィールド：\n${fieldLabels.join(", ")}`

      // --------------------
      // 会話履歴登録
      // --------------------
      const reqConversation: InsertConversationRequest = {
        userId: context.userId,
        sessionId: sessionId,
        actionType: typeLlmResult.userMessageType,
        resultMessage: resultMessage,
        resultMessageDetail: messageDetail,
        aiResponse: JSON.stringify({
          appName: LlmResult.applicationName,
          fields: filteredFields
        }),
        conversationId: context.conversationId,
      };
      await insertConversation(reqConversation);

      // --------------------
      // 結果返却
      // --------------------
      return {
        actionType: typeLlmResult.userMessageType,
        message: {
          role: MessageType.ai, content: resultMessage, messageDetail: messageDetail,
        },
        settingInfo: {
          appName: LlmResult.applicationName,
          fields: filteredFields
        },
        sessionId: sessionId,
        isCreating: isCreating,
      }
    }
    // --------------------
    // その他 の処理
    // --------------------
    else {
      if (typeLlmResult.userMessageType === ActionType.duplicate) {
        // 「複製」の場合は以下のメッセージ TODO: メッセージの修正
        typeLlmResult.response = `複製はこちらのページをご覧ください。
https://jp.cybozu.help/k/ja/user/create_app/app_recycle.html`
      }
      // --------------------
      // 会話履歴登録
      // --------------------
      const reqConversation: InsertConversationRequest = {
        userId: context.userId,
        sessionId: sessionId,
        actionType: typeLlmResult.userMessageType,
        resultMessage: typeLlmResult.response,
        resultMessageDetail: "",
        conversationId: context.conversationId,
      };
      await insertConversation(reqConversation);

      // --------------------
      // 結果返却
      // --------------------
      return {
        actionType: typeLlmResult.userMessageType,
        message: {
          role: MessageType.ai, content: typeLlmResult.response,
        },
        sessionId: sessionId,
        isCreating: isCreating,
      }
    }

  } catch (e) {
    console.log(e)
    if (e instanceof LlmError || e instanceof ApiError) {
      const message = e.message;
      const reqConversation: InsertConversationRequest = {
        userId: context.userId,
        sessionId: sessionId,
        actionType: ActionType.error,
        resultMessage: message,
        resultMessageDetail: "",
        conversationId: context.conversationId,
      };
      await insertConversation(reqConversation);
      return { actionType: ActionType.error, message: { role: MessageType.error, content: message, }, sessionId: sessionId, isCreating: isCreating }
    } else {
      const message = `${ErrorMessageConst.E_MSG008}（${ErrorCode.E99999}）`;
      const reqConversation: InsertConversationRequest = {
        userId: context.userId,
        sessionId: sessionId,
        actionType: ActionType.error,
        resultMessage: message,
        resultMessageDetail: "",
        conversationId: context.conversationId,
      };
      await insertConversation(reqConversation);
      return { actionType: ActionType.error, message: { role: MessageType.error, content: message, }, sessionId: sessionId, isCreating: isCreating }
    }
  }
}


/**
 * 会話履歴の設定
 * @param chatHistory 
 * @returns histories
 */
function setChatHistory(chatHistory: ChatHistory) {

  // 会話履歴の設定
  const histories: BaseMessage[] = [];
  chatHistory.forEach(history => {
    // AI回答がある場合、会話履歴に追加
    if (history.human.role === MessageType.human && (history.ai && history.ai.role === MessageType.ai)) {
      histories.push(new HumanMessage(history.human.content));
      histories.push(new AIMessage(history.ai.content));
    }
  });
  return histories;
}
