import { APIGatewayRequestAuthorizerEvent, PolicyDocument } from 'aws-lambda';

interface AllowPolicy {
  principalId: string;
  policyDocument: PolicyDocument;
}

export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<AllowPolicy> => {
  // これらの情報はSecrets Managerなどに持たせる必要がありそう
  const allowedCidr: string = '103.79.14.0/24';
  const allowedSystemKey: string = 'abcdefghijklmn';

  const sourceIp: string = event.requestContext.identity.sourceIp;
  const systemKey: string | undefined = event.headers?.system_key || event.headers?.system_key;


  if (!sourceIp.startsWith(allowedCidr.slice(0, -4))) {
    throw new Error('Unauthorized IP address');
  }
  if (systemKey !== allowedSystemKey) {
    throw new Error('Unauthorized system_key');
  }

  // ここでAWSのポリシーを返し、API Gatewayがアクセスを許可するようにします。
  return generateAllowPolicy(event.methodArn);
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