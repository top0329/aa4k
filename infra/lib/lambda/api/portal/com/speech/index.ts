import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PollyClient, SynthesizeSpeechCommand, Engine, VoiceId } from "@aws-sdk/client-polly";
import { SpeechRequestBody, SpeechRequestBodySchema } from "./schema";
import { ErrorCode } from "./constants";
import { ValidationError, RequestHeaderName } from "../../../../utils";

/**
 * Text To Speech API
 * @param event 
 * @param context 
 * @returns 
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  let subdomain;
  let body;
  let retErrorStatus = 500;
  let retErrorMessage = "Internal server error";
  let retErrorCode: ErrorCode = ErrorCode.A107099;
  try {
    subdomain = event.headers[RequestHeaderName.aa4kSubdomain] as string;
    body = (event.body ? JSON.parse(event.body) : {}) as SpeechRequestBody;
    // リクエストのバリデーション
    validateRequestParam(body);

    const pollyClient = new PollyClient();
    const command = new SynthesizeSpeechCommand({
      OutputFormat: "mp3",
      Text: body.text,
      VoiceId: VoiceId.Tomoko,
      Engine: Engine.NEURAL,
    });
    const data = await pollyClient.send(command);
    if (!data.AudioStream) throw new Error("data.AudioStream is not found");
    const audioStream = await data.AudioStream.transformToString("base64");

    response = {
      statusCode: 200,
      body: JSON.stringify({ data: audioStream }),
    };
  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subdomain: subdomain,
      error: err,
    });
    console.error(errorMessage);
    if (err instanceof ValidationError) {
      retErrorStatus = 400;
      retErrorMessage = "Bad Request";
      retErrorCode = ErrorCode.A107001;
    }
    response = {
      statusCode: retErrorStatus,
      body: JSON.stringify({ message: retErrorMessage, errorCode: retErrorCode })
    };
  }
  return response;
}

/**
 * リクエストパラメータのバリデーション
 * @param pluginVersion 
 */
const validateRequestParam = (body: SpeechRequestBody) => {
  try {
    // ボディ
    SpeechRequestBodySchema.parse(body);
  } catch (err) {
    throw new ValidationError('Invalid request parameters');
  }
}