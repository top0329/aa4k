import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as nodelambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Runtime, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { ContextProps } from './type';
import { Aa4kSecretsStack } from './secret-stack'
import { AuroraStack } from './aurora-stack'
import { Aa4kElastiCacheStack } from './elasticache-stack'
import { Aa4kParameterStack } from './parameter-stack'

export class Aa4kApiAiProxyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, contextProps: ContextProps, secretsStack: Aa4kSecretsStack, auroraStack: AuroraStack, elastiCacheStack: Aa4kElastiCacheStack, parameterStack: Aa4kParameterStack, props?: cdk.StackProps) {
    super(scope, id, props);
    const stageName = contextProps.stageName;

    // API Gateway
    const accessPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['execute-api:Invoke'],
          principals: [new iam.AnyPrincipal()],
          resources: ['execute-api:/*/*/*'],
        }),
      ]
    })

    const restapi = new apigateway.RestApi(this, 'RestApi', {
      restApiName: `Aa4k-${stageName}-Azure-OpenAI-Proxy-RestAPI`,
      policy: accessPolicy,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["*"],
        statusCode: 200,
      }
    })

    // ******************************
    // WAF Web ACL
    // ******************************
    const webAcl = new cdk.aws_wafv2.CfnWebACL(this, "WafV2WebAcl", {
      defaultAction: { allow: {} },
      scope: "REGIONAL",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: "wafV2WebAcl",
      },
      rules: [],
    })
    // APIGWとWebACLを紐付ける
    const stage = restapi.deploymentStage.stageName;
    new wafv2.CfnWebACLAssociation(this, 'WebAclAssociation', {
      resourceArn: `arn:aws:apigateway:${this.region}::/restapis/${restapi.restApiId}/stages/${stage}`,
      webAclArn: webAcl.attrArn,
    });


    // ******************************
    // Lambda関数
    // ******************************
    // ------------------------------
    // プラグイン機能
    // ------------------------------
    // Lambda 関数を定義
    const authorizerFunction = new nodelambda.NodejsFunction(this, "AuthorizerFunction", {
      entry: __dirname + "/lambda/authorizer/index.ts",
      handler: 'index.handler',
      vpc: auroraStack.vpc,
      securityGroups: [auroraStack.auroraAccessableSG, elastiCacheStack.elastiCacheAccessableSG, parameterStack.ssmAccessableSG],
      environment: {
        AZURE_SECRET_NAME: secretsStack.azureSecret.secretName,
        DB_ACCESS_SECRET_NAME: auroraStack.dbAdminSecret ? auroraStack.dbAdminSecret.secretName : "",
        RDS_PROXY_ENDPOINT: auroraStack.rdsProxyEndpoint,
        REDIS_ENDPOINT: elastiCacheStack.redisEndpoint,
        REDIS_ENDPOINT_PORT: elastiCacheStack.redisEndpointPort,
        AA4K_CONST_PARAMETER_NAME: parameterStack.aa4kConstParameter.parameterName,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    })
    const lambdaAuthorizer = new apigateway.RequestAuthorizer(this, 'Authorizer', {
      handler: authorizerFunction,
      identitySources: [apigateway.IdentitySource.header('aa4k-subscription-id')]
    });
    secretsStack.azureSecret.grantRead(authorizerFunction);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(authorizerFunction);
    parameterStack.aa4kConstParameter.grantRead(authorizerFunction);

    // AWS Credential Provider Lambda
    const credProviderLambda = new nodelambda.NodejsFunction(this, "AzureOpenAIProxyCredentialLambda", {
      entry: __dirname + "/lambda/azureOpenaiProxy/credential/index.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      runtime: Runtime.NODEJS_20_X
    })
    const proxyInvokeRole = new iam.Role(this, "AzureOpenAiProxyInvokeRole", {
      assumedBy: new iam.ArnPrincipal(credProviderLambda.role!.roleArn),
    })
    credProviderLambda.addEnvironment("PROXY_INVOKE_ROLE_ARN", proxyInvokeRole.roleArn)

    restapi.root.addResource("azure_openai_proxy_credential").addMethod(
      "POST",
      new apigateway.LambdaIntegration(credProviderLambda),
      {
        authorizer: lambdaAuthorizer,
      }
    )

    // ------------------------------
    // ポータル機能
    // ------------------------------
    const restapi_portal = restapi.root.addResource("portal")
    const portalAuthFunction = new nodelambda.NodejsFunction(this, "PortalAuthFunction", {
      entry: __dirname + "/lambda/authorizer/portal/index.ts",
      handler: 'index.handler',
      vpc: auroraStack.vpc,
      securityGroups: [auroraStack.auroraAccessableSG, elastiCacheStack.elastiCacheAccessableSG, parameterStack.ssmAccessableSG],
      environment: {
        AZURE_SECRET_NAME: secretsStack.azureSecret.secretName,
        DB_ACCESS_SECRET_NAME: auroraStack.dbAdminSecret ? auroraStack.dbAdminSecret.secretName : "",
        RDS_PROXY_ENDPOINT: auroraStack.rdsProxyEndpoint,
        REDIS_ENDPOINT: elastiCacheStack.redisEndpoint,
        REDIS_ENDPOINT_PORT: elastiCacheStack.redisEndpointPort,
        AA4K_CONST_PARAMETER_NAME: parameterStack.aa4kConstParameter.parameterName,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    })
    const portalAuth = new apigateway.RequestAuthorizer(this, 'PortalAuthorizer', {
      handler: portalAuthFunction,
      identitySources: [apigateway.IdentitySource.header('aa4k-subdomain')]
    });
    secretsStack.azureSecret.grantRead(portalAuthFunction);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(portalAuthFunction);
    parameterStack.aa4kConstParameter.grantRead(portalAuthFunction);

    // AWS Credential Provider Lambda
    const portal_credProviderLambda = new nodelambda.NodejsFunction(this, "Portal_CredProviderLambda", {
      entry: __dirname + "/lambda/azureOpenaiProxy/portal/credential/index.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      runtime: Runtime.NODEJS_20_X
    })
    const portal_proxyInvokeRole = new iam.Role(this, "Portal_proxyInvokeRole", {
      assumedBy: new iam.ArnPrincipal(portal_credProviderLambda.role!.roleArn),
    })
    portal_credProviderLambda.addEnvironment("PROXY_INVOKE_ROLE_ARN", portal_proxyInvokeRole.roleArn)

    restapi_portal.addResource("azure_openai_proxy_credential").addMethod(
      "POST",
      new apigateway.LambdaIntegration(portal_credProviderLambda),
      {
        authorizer: portalAuth,
      }
    )



    // Proxy Lambda
    const azureOpenaiProxyLambda = new nodelambda.NodejsFunction(this, "AzureOpenAIProxyLambda", {
      entry: __dirname + "/lambda/azureOpenaiProxy/index.ts",
      handler: "handler",
      vpc: auroraStack.vpc,
      environment: {
        AZURE_SECRET_NAME: secretsStack.azureSecret.secretName,
      },
      timeout: cdk.Duration.seconds(900),
      runtime: Runtime.NODEJS_20_X
    })
    const proxyFuncUrl = azureOpenaiProxyLambda.addFunctionUrl({ authType: FunctionUrlAuthType.AWS_IAM })
    azureOpenaiProxyLambda.grantInvokeUrl(proxyInvokeRole)
    azureOpenaiProxyLambda.grantInvokeUrl(portal_proxyInvokeRole)
    secretsStack.azureSecret.grantRead(azureOpenaiProxyLambda)
    new cdk.CfnOutput(this, "AzureOpenAiProxyURL", { value: proxyFuncUrl.url })


  }
}
