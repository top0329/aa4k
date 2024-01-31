import { APIGatewayRequestAuthorizerEvent, PolicyDocument } from 'aws-lambda';
import ipCidr from 'ip-cidr';
import { getParameterValues, getSecretValues } from "../utils";
import { getContractStatus } from "../utils/getContractStatus";
import { RequestHeaderName, ContractStatus } from "../utils/type";
import { getSubscriptionData } from "../utils/getSubscriptionData"

interface AllowPolicy {
  principalId: string;
  policyDocument: PolicyDocument;
}

export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<AllowPolicy> => {
  let subscriptionId: string | undefined;

  try {
    const sourceIp: string = event.requestContext.identity.sourceIp;
    if (event.headers) subscriptionId = event.headers[RequestHeaderName.aa4kSubscriptionId];

    if (!subscriptionId) {
      // subscriptionIdを取得できない場合はアクセスを拒否する
      return generateDenyPolicy(event.methodArn);
    }

    // 並列でSecret Manager情報とParameter Store情報を取得させる
    const [secret, parameter] = await Promise.all([
      getSecretValues(),
      getParameterValues(),
    ]);

    // IPアドレスチェック
    const isIpExist = parameter.aa4kConstParameterValue.allowedCidrs.some((allowedCidr) => {
      const cidr = new ipCidr(allowedCidr);
      return cidr.contains(sourceIp);
    });
    if (!isIpExist) {
      // 許可IPアドレスでない場合はアクセスを拒否する
      return generateDenyPolicy(event.methodArn);
    }

    // サブスクリプション存在チェック
    const subscriptionData = await getSubscriptionData(subscriptionId, secret.dbAccessSecretValue)
    if (!subscriptionData) {
      return generateDenyPolicy(event.methodArn);
    }

    // 契約ステータスチェック
    const contractStatus = getContractStatus(subscriptionData);
    if (contractStatus === ContractStatus.expired) {
      return generateDenyPolicy(event.methodArn);
    }

    // アクセスを許可する
    return generateAllowPolicy(event.methodArn);
  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subscriptionId: subscriptionId,
      error: err,
    });
    console.error(errorMessage);

    return generateDenyPolicy(event.methodArn);
  }
};

function generateAllowPolicy(methodArn: string): AllowPolicy {
  const policy: AllowPolicy = {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: methodArn
        }
      ]
    }
  };
  return policy;
}

function generateDenyPolicy(methodArn: string): AllowPolicy {
  const policy: AllowPolicy = {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: methodArn
        }
      ]
    }
  };
  return policy;
}
