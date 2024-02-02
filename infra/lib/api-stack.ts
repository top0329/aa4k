import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as nodelambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { ContextProps } from './type';
import { Aa4kSecretsStack } from './secret-stack'
import { AuroraStack } from './aurora-stack'
import { Aa4kElastiCacheStack } from './elasticache-stack'
import { Aa4kParameterStack } from './parameter-stack'

export class Aa4kApiStack extends cdk.Stack {
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
        // Whitelist IP
        // **** サイボウズ社への展開のためIP制限解除中 ****
        // new iam.PolicyStatement({
        //   effect: iam.Effect.DENY,
        //   principals: [new iam.AnyPrincipal()],
        //   actions: ['execute-api:Invoke'],
        //   resources: ['execute-api:/*/*/*'],
        //   conditions: {
        //     'NotIpAddress': {
        //       "aws:SourceIp": settings.apiIpWhilelist
        //     }
        //   }
        // }),
      ]
    })

    const restapi = new apigateway.RestApi(this, 'RestApi', {
      restApiName: `Aa4k-${stageName}-RestAPI`,
      policy: accessPolicy,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
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
    // Lambdaオーソライザー
    // ******************************
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

    // ******************************
    // Lambda関数
    // ******************************
    // codeTemplate Lambda
    const codeTemplateLambda = new nodelambda.NodejsFunction(this, "CodeTemplateLambda", {
      entry: __dirname + "/lambda/api/codeTemplate/index.ts",
      handler: "handler",
      vpc: auroraStack.vpc,
      securityGroups: [auroraStack.auroraAccessableSG, elastiCacheStack.elastiCacheAccessableSG],
      environment: {
        AZURE_SECRET_NAME: secretsStack.azureSecret.secretName,
        DB_ACCESS_SECRET_NAME: auroraStack.dbAdminSecret ? auroraStack.dbAdminSecret.secretName : "",
        RDS_PROXY_ENDPOINT: auroraStack.rdsProxyEndpoint,
        REDIS_ENDPOINT: elastiCacheStack.redisEndpoint,
        REDIS_ENDPOINT_PORT: elastiCacheStack.redisEndpointPort,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    })
    secretsStack.azureSecret.grantRead(codeTemplateLambda)
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(codeTemplateLambda)
    restapi.root.addResource("code_template").addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(codeTemplateLambda),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        authorizer: lambdaAuthorizer,
      }
    });

    // conversationHistory Lambda
    const conversationHistoryLambda = new nodelambda.NodejsFunction(this, "ConversationHistoryLambda", {
      entry: __dirname + "/lambda/api/conversationHistory/index.ts",
      handler: "handler",
      vpc: auroraStack.vpc,
      securityGroups: [auroraStack.auroraAccessableSG, elastiCacheStack.elastiCacheAccessableSG],
      environment: {
        AZURE_SECRET_NAME: secretsStack.azureSecret.secretName,
        DB_ACCESS_SECRET_NAME: auroraStack.dbAdminSecret ? auroraStack.dbAdminSecret.secretName : "",
        RDS_PROXY_ENDPOINT: auroraStack.rdsProxyEndpoint,
        REDIS_ENDPOINT: elastiCacheStack.redisEndpoint,
        REDIS_ENDPOINT_PORT: elastiCacheStack.redisEndpointPort,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    });
    secretsStack.azureSecret.grantRead(conversationHistoryLambda);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(conversationHistoryLambda);
    restapi.root.addResource("conversation_history").addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(conversationHistoryLambda),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        authorizer: lambdaAuthorizer,
      }
    });

    // generatedCode Lambda
    const generatedCodeLambda = new nodelambda.NodejsFunction(this, "GeneratedCodeLambda", {
      entry: __dirname + "/lambda/api/generatedCode/index.ts",
      handler: "handler",
      vpc: auroraStack.vpc,
      securityGroups: [auroraStack.auroraAccessableSG, elastiCacheStack.elastiCacheAccessableSG],
      environment: {
        AZURE_SECRET_NAME: secretsStack.azureSecret.secretName,
        DB_ACCESS_SECRET_NAME: auroraStack.dbAdminSecret ? auroraStack.dbAdminSecret.secretName : "",
        RDS_PROXY_ENDPOINT: auroraStack.rdsProxyEndpoint,
        REDIS_ENDPOINT: elastiCacheStack.redisEndpoint,
        REDIS_ENDPOINT_PORT: elastiCacheStack.redisEndpointPort,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    });
    secretsStack.azureSecret.grantRead(generatedCodeLambda);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(generatedCodeLambda);
    restapi.root.addResource("generated_code").addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(generatedCodeLambda),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        authorizer: lambdaAuthorizer,
      }
    });

    // pre-check Lambda
    const preCheck = new nodelambda.NodejsFunction(this, "preCheck", {
      entry: __dirname + "/lambda/api/preCheck/index.ts",
      handler: "handler",
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
    secretsStack.azureSecret.grantRead(preCheck);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(preCheck)
    parameterStack.aa4kConstParameter.grantRead(preCheck);
    restapi.root.addResource("pre_check").addMethod("POST", new apigateway.LambdaIntegration(preCheck), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: lambdaAuthorizer,
    })

    // LangchainLog Lambda
    const langchainLog = new nodelambda.NodejsFunction(this, "LangchainLogLambda", {
      entry: __dirname + "/lambda/api/langchainLog/index.ts",
      handler: "handler",
      vpc: auroraStack.vpc,
      securityGroups: [auroraStack.auroraAccessableSG],
      environment: {
        AZURE_SECRET_NAME: secretsStack.azureSecret.secretName,
        DB_ACCESS_SECRET_NAME: auroraStack.dbAdminSecret ? auroraStack.dbAdminSecret.secretName : "",
        RDS_PROXY_ENDPOINT: auroraStack.rdsProxyEndpoint,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    })
    secretsStack.azureSecret.grantRead(langchainLog);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(langchainLog)
    restapi.root.addResource("langchain_log").addMethod("POST", new apigateway.LambdaIntegration(langchainLog), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: lambdaAuthorizer,
    })
  }
}
