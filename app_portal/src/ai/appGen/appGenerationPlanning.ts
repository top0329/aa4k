import { AIMessage, BaseMessage, HumanMessage } from "langchain/schema"

import { v4 as uuidv4 } from 'uuid';

import { setPrompt, executeLlm } from "../common"
import {
  AppGenerationPlanningResponse,
  AppGenerationPlanningConversation,
  ChatHistory,
  AppGenerationPlanningContext,
  Field,
  ChatHistoryItem,
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
        const editFieldPromptInfo = promptInfo.filter(info => info.service_div === ServiceDiv.app_gen_edit_field);
        const appName = context.settingInfo ? context.settingInfo.appName : "";
        const fields = context.settingInfo ? JSON.stringify(context.settingInfo.fields) : "";
        const editFieldLlmResult = await executeLlm(message.content, histories, context.contractStatus, editFieldPromptInfo[0], { applicationName: appName, settingInfo: JSON.stringify(fields) }, llmContext)
        LlmResult = editFieldLlmResult;
      }

      let addMessage = "";
      // kintone固有フィールドの対応
      const kintoneFieldList = ["レコード番号", "レコードID", "リビジョン", "ステータス", "カテゴリー", "作業者", "作成日時", "更新日時", "作成者", "更新者"]
      let filteredFields: Field[] = [];
      const excludedLabels: string[] = [];

      LlmResult.fields.forEach((field: Field) => {
        if (kintoneFieldList.includes(field.label)) {
          excludedLabels.push(field.label);
        } else {
          filteredFields.push(field);
        }
      });

      // kintone固有フィールドがあった場合、ユーザに表示するメッセージにその旨を追記
      addMessage = excludedLabels.length && typeLlmResult.userMessageType === ActionType.edit ? `${excludedLabels.join("、")}はkintoneの固定フィールドのため指定できません。\n\n` : "";

      // フィールド数の制限 (20件)
      const beforeFiledCount = context.settingInfo ? context.settingInfo.fields.length : 0;
      const afterFieldCount = filteredFields.length;
      const isAddField = beforeFiledCount && beforeFiledCount < afterFieldCount ? true : false;
      const isLimitFieldCount = isAddField && afterFieldCount > 20 ? true : false;

      if (isLimitFieldCount) {
        addMessage = "フィールドの数が多すぎるため、追加できませんでした。\n\n"
        filteredFields = context.settingInfo ? context.settingInfo.fields : [];
      }

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
      const lastChatHistoryItem = chatHistory[chatHistory.length -1];
      if (typeLlmResult.userMessageType === ActionType.duplicate) {
        // 「複製」の場合は以下のメッセージ
        typeLlmResult.response = `本製品では既存アプリの複製(コピー)はできません。\nほかのアプリを再利用したい場合はこちらの手順を参考にしてください。\n\nhttps://jp.cybozu.help/k/ja/user/create_app/app_recycle.html`
      } else {
        if (getLatestMessageDetail(lastChatHistoryItem)) {
          // 「雑談」「理解不能」、かつmessageDetail（アプリ情報）が存在する場合は以下のメッセージ
          typeLlmResult.response = `${typeLlmResult.response}\n\n${ErrorMessageConst.E_MSG004}`
        }
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
          role: MessageType.ai, content: typeLlmResult.response, messageDetail: getLatestMessageDetail(lastChatHistoryItem),
        },
        settingInfo: context.settingInfo,
        sessionId: sessionId,
        isCreating: isCreating,
      }
    }

  } catch (e) {
    console.log(e)
    const lastChatHistoryItem = chatHistory[chatHistory.length -1];
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
      return {
        actionType: ActionType.error,
        message: {
          role: MessageType.error, content: message, messageDetail: getLatestMessageDetail(lastChatHistoryItem),
        },
        settingInfo: context.settingInfo,
        sessionId: sessionId,
        isCreating: isCreating
      }
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
      return {
        actionType: ActionType.error,
        message: {
          role: MessageType.error, content: message, messageDetail: getLatestMessageDetail(lastChatHistoryItem),
        },
        settingInfo: context.settingInfo,
        sessionId: sessionId,
        isCreating: isCreating
      }
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
      histories.push(new AIMessage(`${history.ai.content}\n${history.ai.messageDetail}`));
    }
  });
  return histories;
}

/**
 * 最新のmessageDetailを取得
 * @param lastChatHistoryItem 
 * @returns messageDetail || ""
 */
function getLatestMessageDetail(lastChatHistoryItem: ChatHistoryItem) {
  if (lastChatHistoryItem) {
    if (lastChatHistoryItem.ai) {
      return lastChatHistoryItem.ai.messageDetail || "";
    } else if (lastChatHistoryItem.error) {
      return lastChatHistoryItem.error.messageDetail || "";
    }
  }
  return "";
};
