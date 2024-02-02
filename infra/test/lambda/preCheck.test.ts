import { handler } from '../../lib/lambda/api/preCheck';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { ContractStatus } from "../../lib/lambda/utils";

// mockを作成するため、定義元からインポートする
import { getParameterValues } from '../../lib/lambda/utils/getParameterValues';
import { getSecretValues } from '../../lib/lambda/utils/getSecretValues';
import { getContractStatus } from "../../lib/lambda/utils/getContractStatus";
import { checkPluginVersion } from "../../lib/lambda/utils/checkPluginVersion";
import { getSubscriptionData } from "../../lib/lambda/utils/getSubscriptionData"

describe('handler', () => {
  let event: APIGatewayProxyEvent;
  let context: Context;

  beforeEach(() => {
    event = {
      headers: {
        "aa4k-subscription-id": 'a1c98a74-d1ef-d0bb-abd0-be0534d35aeb',
        "aa4k-plugin-version": 'test-plugin-version'
      }
    } as unknown as APIGatewayProxyEvent;

    context = {} as Context;

    (getSecretValues as jest.Mock) = jest.fn().mockReturnValue({ dbAccessSecretValue: 'test-secret' });
    (getParameterValues as jest.Mock) = jest.fn().mockReturnValue({
      aa4kConstParameterValue: {
        allowedCidrs: [],
        retrieveMaxCount: 10,
        retrieveScoreThreshold: 0.2,
        historyUseCount: 3,
      }
    });
    (checkPluginVersion as jest.Mock) = jest.fn().mockReturnValue(true);
    (getSubscriptionData as jest.Mock) = jest.fn().mockReturnValue('test-subscription-data');
    (getContractStatus as jest.Mock) = jest.fn().mockReturnValue(ContractStatus.active);
  });

  it('正常系', async () => {
    const response = await handler(event, context);

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        contractStatus: ContractStatus.active,
        systemSettings: {
          retrieveMaxCount: 10,
          retrieveScoreThreshold: 0.2,
          historyUseCount: 3
        }
      })
    });
  });

  it('サブスクリプションIDの形式が正しくない場合、Bad Requestエラーを返す', async () => {
    event = {
      headers: {
        "aa4k-subscription-id": 'unexpected-id',
        "aa4k-plugin-version": 'test-plugin-version'
      }
    } as unknown as APIGatewayProxyEvent;
    const response = await handler(event, context);

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: "Bad Request" })
    });
  });

  it('サブスクリプションIDが登録済みのものではない場合、Not Foundエラーを返す', async () => {
    (getSubscriptionData as jest.Mock) = jest.fn().mockReturnValue(null);

    const response = await handler(event, context);

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({ message: "SubscriptionData is Not Found" })
    });
  });

  it('プラグインバージョンを指定していない場合、Bad Requestエラーを返す', async () => {
    delete event.headers["aa4k-plugin-version"]
    const response = await handler(event, context);

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: "Bad Request" })
    });
  });

  it('プラグインバージョンが有効ではない場合、Unsupported Versionエラーを返す', async () => {
    (checkPluginVersion as jest.Mock) = jest.fn().mockReturnValue(false);

    const response = await handler(event, context);

    expect(response).toEqual({
      statusCode: 422,
      body: JSON.stringify({ message: "Unsupported Version" })
    });
  });
});
