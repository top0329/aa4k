import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts"
import { z } from "zod";
import { AzureOpenAIProxyCredentialBody, AzureOpenAIProxyCredentialBodySchema } from "./schema";
import { ValidationError, RequestHeaderName } from "../../../utils";
import { ErrorCode } from "../../constants";

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subscriptionId;
  let body;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A07099;
  const client = new STSClient({});
  try {
    subscriptionId = event.headers[RequestHeaderName.aa4kSubscriptionId] as string;
    body = (event.body ? JSON.parse(event.body) : {}) as AzureOpenAIProxyCredentialBody;
    // リクエストのバリデーション
    validateRequestParam(subscriptionId, body);

    const command = new AssumeRoleCommand({
      RoleArn: process.env["PROXY_INVOKE_ROLE_ARN"],
      RoleSessionName: body.sessionId,
      DurationSeconds: 900,
    });
    const result = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ ...result.Credentials })
    };
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
      retErrorCode = ErrorCode.A07001;
    }
    response = {
      statusCode: retErrorStatus,
      body: JSON.stringify({ message: retErrorMessage, errorCode: retErrorCode })
    };
  }
  return response;
};


/**
 * リクエストパラメータのバリデーション
 */
const validateRequestParam = (subscriptionId: string, reqBody: AzureOpenAIProxyCredentialBody) => {
  try {
    // ヘッダー.サブスクリプションID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(subscriptionId);
    // ボディ
    AzureOpenAIProxyCredentialBodySchema.parse(reqBody);

  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}