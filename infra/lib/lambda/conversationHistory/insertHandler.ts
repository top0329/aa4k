import { Response, Request } from "express";
import { Client } from "pg";
import { z } from "zod";
import { InsertRequestBody, InsertRequestBodySchema } from "./type";
import { insertConversationHistory, updateAiConversationHistory, updateSystemConversationHistory } from "./dao";
import { getSecretValues, getDbConfig, ValidationError } from "../utils";
import { changeSchemaSearchPath } from "../utils/dao";
import { MessageType, RequestHeaderName } from "../utils/type";

export const insertHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let pluginVersion;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";

  try {
    subscriptionId = req.header(RequestHeaderName.aa4kSubscriptionId) as string;
    pluginVersion = req.header(RequestHeaderName.aa4kPluginVersion) as string;
    body = (req.body ? JSON.parse(req.body) : {}) as InsertRequestBody;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, pluginVersion, body);

    // 開始ログの出力
    const startLog = {
      message: "会話履歴API(会話履歴登録)開始",
      subscriptionId: subscriptionId,
      pluginVersion: pluginVersion,
    };
    console.info(startLog);

    // Secret Manager情報の取得(DB_ACCESS_SECRET)
    const { dbAccessSecretValue } = await getSecretValues();

    // データベース接続情報
    const dbConfig = getDbConfig(dbAccessSecretValue)
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // スキーマ検索パスを変更
    // TODO: スキーマ名は契約管理TBLから取得予定（契約管理TBLは現在未作成）
    await changeSchemaSearchPath(dbClient, "service");

    switch (body.messageType) {
      case MessageType.human:
        // 会話履歴TBLへのユーザー発言の登録
        const queryResult = await insertConversationHistory(dbClient, body);
        res.status(200).json({ conversationId: queryResult.rows[0].id });
        break;
      case MessageType.ai:
        // 会話履歴TBLへのAI発言の登録
        await updateAiConversationHistory(dbClient, body);
        res.status(200).json({ conversationId: body.conversationId });
        break;
      case MessageType.system:
        // 会話履歴TBLへのシステム発言の登録
        await updateSystemConversationHistory(dbClient, body);
        res.status(200).json({ conversationId: body.conversationId });
        break;
      default:
        const unexpected: never = body.messageType;
        throw new Error(`Unexpected messageType: ${unexpected}`);
    }
  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subscriptionId: subscriptionId,
      body: body,
      error: err,
    });
    console.error(errorMessage);
    if (err instanceof ValidationError) {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
    }
    res.status(retErrorStatus).json({ message: retErrorMessage });
  } finally {
    if (dbClient) {
      // データベース接続を閉じる
      await dbClient.end();
    }
  }
}

/**
 * リクエストパラメータのバリデーション
 * @param subscriptionId 
 * @param reqQuery 
 */
const validateRequestParam = (subscriptionId: string, pluginVersion: string, body: InsertRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ヘッダー.プラグインバージョン
    const pluginVersionSchema = z.string();
    pluginVersionSchema.parse(pluginVersion);
    // ボディ
    InsertRequestBodySchema.parse(body);
  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}