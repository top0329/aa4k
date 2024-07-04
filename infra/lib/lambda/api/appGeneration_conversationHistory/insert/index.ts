import { Response, Request } from "express";
import { Client } from "pg";
import { z } from "zod";
import { InsertRequestBody, InsertRequestBodySchema } from "./schema";
import { insertConversationHistory, updateAiConversationHistory } from "./dao";
import { ErrorCode } from "../constants";
import { getSecretValues, getDbConfig, ValidationError, RequestHeaderName, getSubdomainData, changeSchemaSearchPath } from "../../../utils";

export const insertHandler = async (req: Request, res: Response) => {
  let subdomain;
  let portalJsVersion;
  let body;
  let dbClient: Client | undefined;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A13099;

  try {
    subdomain = req.header(RequestHeaderName.aa4kSubdomain) as string;
    portalJsVersion = req.header(RequestHeaderName.aa4kPortalJsVersion) as string;
    body = (req.body ? JSON.parse(req.body) : {}) as InsertRequestBody;
    // リクエストのバリデーション
    validateRequestParam(subdomain, portalJsVersion, body);

    // 開始ログの出力
    const startLog = {
      message: "会話履歴_アプリ生成用API(会話履歴登録)開始",
      subdomain: subdomain,
      portalJsVersion: portalJsVersion,
    };
    console.info(startLog);

    // Secret Manager情報の取得(DB_ACCESS_SECRET)
    const { dbAccessSecretValue } = await getSecretValues();

    // サブドメイン情報の取得
    const subdomainData = await getSubdomainData(subdomain, dbAccessSecretValue);
    if (!subdomainData) {
      retErrorStatus = 404;
      retErrorMessage = "SubdomainData is Not Found";
      retErrorCode = ErrorCode.A13002;
      throw new Error("SubdomainData is Not Found")
    }
    // スキーマ名
    const schema = subdomainData.schema_name;

    // データベース接続情報
    const dbConfig = getDbConfig(dbAccessSecretValue)
    // データベース接続
    dbClient = new Client(dbConfig);
    await dbClient.connect();

    // スキーマ検索パスを変更
    await changeSchemaSearchPath(dbClient, schema);

    if (!body.conversationId) {
      // 会話履歴TBLへの登録
      const queryResult = await insertConversationHistory(dbClient, subdomain, body);
      res.status(200).json({ conversationId: queryResult.rows[0].id });
    } else {
      // 会話履歴TBLへの更新
      await updateAiConversationHistory(dbClient, body);
      res.status(200).json({ conversationId: body.conversationId });
    }
  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subdomain: subdomain,
      body: body,
      error: err,
    });
    console.error(errorMessage);
    if (err instanceof ValidationError) {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      retErrorCode = ErrorCode.A13001;
    }
    res.status(retErrorStatus).json({ message: retErrorMessage, errorCode: retErrorCode });
  } finally {
    if (dbClient) {
      // データベース接続を閉じる
      await dbClient.end();
    }
  }
}

/**
 * リクエストパラメータのバリデーション
 * @param subdomain 
 * @param reqQuery 
 */
const validateRequestParam = (subdomain: string, portalJsVersion: string, body: InsertRequestBody) => {
  try {
    // ヘッダー.サブドメイン
    const subdomainSchema = z.string();
    subdomainSchema.parse(subdomain);
    // ヘッダー.ポータルJSバージョン
    const portalJsVersionSchema = z.string();
    portalJsVersionSchema.parse(portalJsVersion);
    // ボディ
    InsertRequestBodySchema.parse(body);
  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}