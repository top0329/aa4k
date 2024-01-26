import { Response, Request } from "express";
import { Client } from "pg";
import { z } from "zod";
import { ListRequestBody, ListRequestBodySchema } from "./type";
import { selectConversationHistory } from "./dao";
import { getSecretValues, getDbConfig } from "../utils";
import { changeSchemaSearchPath } from "../utils/dao";
import { RequestHeaderName } from "../utils/type";
import { checkPluginVersion } from "../utils/versionCheck";

export const listHandler = async (req: Request, res: Response) => {
  let subscriptionId;
  let pluginVersion;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";

  try {
    subscriptionId = req.header(RequestHeaderName.aa4kSubscriptionId) as string;
    pluginVersion = req.header(RequestHeaderName.aa4kPluginVersion) as string;
    body = (req.body ? JSON.parse(req.body) : {}) as ListRequestBody;
    // リクエストのバリデーション
    await validateRequestParam(subscriptionId, pluginVersion, body).catch(async (err) => {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      throw err;
    });

    // 開始ログの出力
    const startLog = {
      message: "会話履歴API(会話履歴取得)開始",
      subscriptionId: subscriptionId,
      pluginVersion: pluginVersion,
    };
    console.info(startLog);

    // Secret Manager情報の取得(DB_ACCESS_SECRET)
    const { dbAccessSecretValue } = await getSecretValues();

    // プラグインバージョンチェック
    const isVersionOk = await checkPluginVersion(pluginVersion, dbAccessSecretValue);
    if (!isVersionOk) {
      res.status(422).json({ message: "Unsupported Version" });
      return;
    }

    // データベース接続情報
    const dbConfig = getDbConfig(dbAccessSecretValue)
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // スキーマ検索パスを変更
    // TODO: スキーマ名は契約管理TBLから取得予定（契約管理TBLは現在未作成）
    await changeSchemaSearchPath(dbClient, "service");

    // 会話履歴一覧の取得
    const queryResult  = await selectConversationHistory(dbClient, body);
    const conversationHistoryList = queryResult.rows;

    // 終了
    res.status(200).json({ conversationHistoryList });
  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subscriptionId: subscriptionId,
      body: body,
      error: err,
    });
    console.error(errorMessage);
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
const validateRequestParam = async (subscriptionId: string, pluginVersion: string, body: ListRequestBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ヘッダー.プラグインバージョン
    const pluginVersionSchema = z.string();
    pluginVersionSchema.parse(pluginVersion);
    // ボディ
    ListRequestBodySchema.parse(body);
  } catch (err) {
    throw err;
  }
}