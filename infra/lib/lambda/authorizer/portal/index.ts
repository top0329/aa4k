import { APIGatewayRequestAuthorizerEvent, PolicyDocument } from 'aws-lambda';
import ipCidr from 'ip-cidr';
import { ErrorCode } from "./constants";
import { getParameterValues, getSecretValues, getContractStatus, getSubscriptionData, getSubdomainData, RequestHeaderName, ContractStatus } from "../../utils";

interface AllowPolicyContent {
  errorCode: ErrorCode;
}

interface AllowPolicy {
  principalId: string;
  policyDocument: PolicyDocument;
  context?: AllowPolicyContent;
}

export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<AllowPolicy> => {
  let subdomain: string | undefined;
  try {
    const sourceIp: string = event.requestContext.identity.sourceIp;
    if (event.headers) subdomain = event.headers[RequestHeaderName.aa4kSubdomain];

    // 開始ログの出力
    const startLog = {
      message: "Lambdaオーソライザー開始",
      subdomain: subdomain,
    };
    console.info(startLog);

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
      const warnLog = {
        message: "許可IPアドレスでない",
        subdomain: subdomain,
      };
      console.info(warnLog);
      // 許可IPアドレスでない場合はアクセスを拒否する
      return generateDenyPolicy(event.methodArn, ErrorCode.A11002);
    }

    if (!subdomain) {
      const warnLog = {
        message: "subdomainを取得できない",
        subdomain: subdomain,
      };
      console.info(warnLog);
      // subdomainを取得できない場合はアクセスを拒否する
      return generateDenyPolicy(event.methodArn, ErrorCode.A11001);
    }
    // サブドメイン有効性チェック(存在チェック)
    const subdomainData = await getSubdomainData(subdomain, secret.dbAccessSecretValue)
    if (!subdomainData) {
      const warnLog = {
        message: "DBに存在しないsubdomain",
        subdomain: subdomain,
      };
      console.info(warnLog);
      return generateDenyPolicy(event.methodArn, ErrorCode.A11003);
    }

    // サブドメイン有効性チェック(契約ステータスチェック)
    const contractStatus = getContractStatus(subdomainData);
    if (contractStatus === ContractStatus.expired) {
      const warnLog = {
        message: "契約期間外のsubdomain",
        subdomain: subdomain,
      };
      console.info(warnLog);
      return generateDenyPolicy(event.methodArn, ErrorCode.A11004);
    }
    // アクセスを許可する
    return generateAllowPolicy(event.methodArn);
  } catch (err) {
    // エラーログの出力
    const errorMessage = ({
      subdomain: subdomain,
      error: err,
    });
    console.error(errorMessage);

    return generateDenyPolicy(event.methodArn, ErrorCode.A11099);
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

function generateDenyPolicy(methodArn: string, errorCode: ErrorCode): AllowPolicy {
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
    },
    context: {
      errorCode: errorCode
    }
  };
  return policy;
}
