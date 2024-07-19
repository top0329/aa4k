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
    const promptInfo = await setPrompt([ServiceDiv.app_gen_type, ServiceDiv.app_gen_app_filed], promptInfoList)
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
    // - unknown: kintone アプリに関係するが、「作成」「編集」「複製」のいずれかに分類するのが難しいメッセージ
    // - other: その他のメッセージ
    // `,
    //         prompt_function_parameter: [
    //           {
    //             item_id: 1,
    //             parent_item_id: null,
    //             item_name: "userMessageType",
    //             item_type: "string",
    //             item_describe: "タイプ一覧",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 2,
    //             parent_item_id: null,
    //             item_name: "response",
    //             item_type: "string",
    //             item_describe: "ユーザのメッセージへの応答",
    //             constants: "null",
    //           }
    //         ],
    //       },
    //       {
    //         service_div: "app_gen_app_filed",
    //         prompt: `あなたは kintone アプリの作成方法に詳しい優秀なプログラマーです。

    // ユーザからアプリ作成の要望があれば、そのアプリに必要なフィールド名の一覧を fields として出力してください。
    // - アプリ名を applicationName として出力してください。
    // - 「（アプリ名）を作成します。\n以下の内容でよろしければ「アプリを作成する」をクリックしてください。また、アプリ名やフィールドの変更をする場合はお知らせください。」を response として出力してください。
    //     - （アプリ名）には applicationName を代入してください。

    // {settingInfo}
    // `,
    //         prompt_function_parameter: [
    //           {
    //             item_id: 1,
    //             parent_item_id: null,
    //             item_name: "response",
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
    //             item_describe: "フィールド名",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 5,
    //             parent_item_id: 4,
    //             item_name: "fieldName",
    //             item_type: "string",
    //             item_describe: "フィールド名",
    //             constants: "null",
    //           },
    //           {
    //             item_id: 6,
    //             parent_item_id: 4,
    //             item_name: "fieldType",
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
      const fieldListPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_app_filed)
      const settingInfoLlmResult = await executeLlm(message.content, histories, context.contractStatus, fieldListPromptInfo[0], { settingInfo: context.settingInfo ? JSON.stringify(context.settingInfo) : "" }, llmContext)

      // 結果回答詳細
      const fieldNames = settingInfoLlmResult.fields.slice(0, 10).map((field: Field) => field.fieldName);
      const messageDetail = `アプリ名:\n${settingInfoLlmResult.applicationName}\n\nフィールド一覧:\n${fieldNames.join(", ")}`

      // --------------------
      // 会話履歴登録
      // --------------------
      const reqConversation: InsertConversationRequest = {
        userId: context.userId,
        sessionId: sessionId,
        actionType: typeLlmResult.userMessageType,
        resultMessage: settingInfoLlmResult.response,
        resultMessageDetail: messageDetail,
        aiResponse: JSON.stringify({
          appName: settingInfoLlmResult.applicationName,
          fields: settingInfoLlmResult.fields
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
          role: MessageType.ai, content: settingInfoLlmResult.response, messageDetail: messageDetail,
        },
        settingInfo: {
          appName: settingInfoLlmResult.applicationName,
          fields: settingInfoLlmResult.fields
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
