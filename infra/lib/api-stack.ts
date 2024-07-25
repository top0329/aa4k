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

    // Gateway Response
    restapi.addGatewayResponse('GatewayResponse', {
      type: apigateway.ResponseType.ACCESS_DENIED,
      statusCode: '403',
      templates: {
        'application/json': '{"message":$context.error.messageString, "errorCode":"$context.authorizer.errorCode"}'
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
    // ------------------------------
    // プラグイン機能
    // ------------------------------
    // Lambda 関数を定義
    const authorizerFunction = new nodelambda.NodejsFunction(this, "AuthorizerFunction", {
      entry: __dirname + "/lambda/authorizer/plugin/index.ts",
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

    // ------------------------------
    // ポータル機能
    // ------------------------------
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


    // ******************************
    // Lambda関数
    // ******************************
    // ------------------------------
    // プラグイン機能
    // ------------------------------
    const restapi_plugin = restapi.root.addResource("plugin")
    const restapi_plugin_com = restapi_plugin.addResource("com")
    const restapi_plugin_js_gen = restapi_plugin.addResource("js_gen")

    // codeTemplate Lambda
    const codeTemplateLambda = new nodelambda.NodejsFunction(this, "CodeTemplateLambda", {
      description: "コードテンプレート管理API",
      entry: __dirname + "/lambda/api/plugin/com/codeTemplate/index.ts",
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
        SUGURES_ENDPOINT: contextProps.suguresEndpoint,
        SUGURES_CLIENT_ID: contextProps.suguresClientId,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    })
    secretsStack.azureSecret.grantRead(codeTemplateLambda)
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(codeTemplateLambda)
    parameterStack.aa4kConstParameter.grantRead(codeTemplateLambda);
    restapi_plugin_com.addResource("code_template").addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(codeTemplateLambda),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        authorizer: lambdaAuthorizer,
      }
    });

    // conversationHistory Lambda
    const conversationHistoryLambda = new nodelambda.NodejsFunction(this, "ConversationHistoryLambda", {
      description: "会話履歴API",
      entry: __dirname + "/lambda/api/plugin/js_gen/conversationHistory/index.ts",
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
        SUGURES_ENDPOINT: contextProps.suguresEndpoint,
        SUGURES_CLIENT_ID: contextProps.suguresClientId,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    });
    secretsStack.azureSecret.grantRead(conversationHistoryLambda);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(conversationHistoryLambda);
    parameterStack.aa4kConstParameter.grantRead(conversationHistoryLambda);
    restapi_plugin_js_gen.addResource("conversation_history").addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(conversationHistoryLambda),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        authorizer: lambdaAuthorizer,
      }
    });

    // generatedCode Lambda
    const generatedCodeLambda = new nodelambda.NodejsFunction(this, "GeneratedCodeLambda", {
      description: "最新JSコード取得API",
      entry: __dirname + "/lambda/api/plugin/com/generatedCode/index.ts",
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
    restapi_plugin_com.addResource("generated_code").addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(generatedCodeLambda),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        authorizer: lambdaAuthorizer,
      }
    });

    // pre-check Lambda
    const preCheck = new nodelambda.NodejsFunction(this, "preCheck", {
      description: "事前チェックAPI",
      entry: __dirname + "/lambda/api/plugin/com/preCheck/index.ts",
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
    restapi_plugin_com.addResource("pre_check").addMethod("POST", new apigateway.LambdaIntegration(preCheck), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: lambdaAuthorizer,
    })

    // speech Lambda
    const speech = new nodelambda.NodejsFunction(this, "SpeechLambda", {
      description: "Text To Speech API",
      entry: __dirname + "/lambda/api/plugin/com/speech/index.ts",
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
    secretsStack.azureSecret.grantRead(speech);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(speech);
    const policyStatement = new iam.PolicyStatement({
      actions: ['polly:SynthesizeSpeech'],
      resources: ['*']
    });
    speech.addToRolePolicy(policyStatement);
    restapi_plugin_com.addResource("speech").addMethod("POST", new apigateway.LambdaIntegration(speech), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: lambdaAuthorizer,
    });

    // LangchainLog Lambda
    const langchainLog = new nodelambda.NodejsFunction(this, "LangchainLogLambda", {
      description: "Langchain実行ログ登録API",
      entry: __dirname + "/lambda/api/plugin/js_gen/langchainLog/index.ts",
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
    secretsStack.azureSecret.grantRead(langchainLog);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(langchainLog)
    restapi_plugin_js_gen.addResource("langchain_log").addMethod("POST", new apigateway.LambdaIntegration(langchainLog), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: lambdaAuthorizer,
    })

    // prompt Lambda
    const prompt = new nodelambda.NodejsFunction(this, "PromptLambda", {
      description: "プロンプト取得API",
      entry: __dirname + "/lambda/api/plugin/com/prompt/index.ts",
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
    secretsStack.azureSecret.grantRead(prompt);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(prompt)
    restapi_plugin_com.addResource("prompt").addMethod("POST", new apigateway.LambdaIntegration(prompt), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: lambdaAuthorizer,
    })

    // ------------------------------
    // ポータル機能
    // ------------------------------
    const restapi_portal = restapi.root.addResource("portal")
    const restapi_portal_com = restapi_portal.addResource("com")
    const restapi_portal_app_gen = restapi_portal.addResource("app_gen")

    // portal_preCheckLambda
    const portal_preCheckLambda = new nodelambda.NodejsFunction(this, "Portal_PreCheckLambda", {
      description: "事前チェック(ポータル用)API",
      entry: __dirname + "/lambda/api/portal/com/preCheck/index.ts",
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
    secretsStack.azureSecret.grantRead(portal_preCheckLambda);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(portal_preCheckLambda)
    parameterStack.aa4kConstParameter.grantRead(portal_preCheckLambda);
    restapi_portal_com.addResource("pre_check").addMethod("POST", new apigateway.LambdaIntegration(portal_preCheckLambda), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: portalAuth,
    })

    // portal_promptLambda
    const portal_promptLambda = new nodelambda.NodejsFunction(this, "Portal_PromptLambda", {
      description: "プロンプト取得API",
      entry: __dirname + "/lambda/api/portal/com/prompt/index.ts",
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
    secretsStack.azureSecret.grantRead(portal_promptLambda);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(portal_promptLambda)
    restapi_portal_com.addResource("prompt").addMethod("POST", new apigateway.LambdaIntegration(portal_promptLambda), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: portalAuth,
    })


    // portal_speechLambda
    const portal_speechLambda = new nodelambda.NodejsFunction(this, "Portal_SpeechLambda", {
      description: "Text To Speech API",
      entry: __dirname + "/lambda/api/portal/com/speech/index.ts",
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
    secretsStack.azureSecret.grantRead(portal_speechLambda);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(portal_speechLambda);
    const policyStatement_portal = new iam.PolicyStatement({
      actions: ['polly:SynthesizeSpeech'],
      resources: ['*']
    });
    portal_speechLambda.addToRolePolicy(policyStatement_portal);
    restapi_portal_com.addResource("speech").addMethod("POST", new apigateway.LambdaIntegration(portal_speechLambda), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: portalAuth,
    });


    // appGen_conversationHistoryLambda
    const appGen_conversationHistoryLambda = new nodelambda.NodejsFunction(this, "AppGen_ConversationHistoryLambda", {
      description: "会話履歴(アプリ生成用)API",
      entry: __dirname + "/lambda/api/portal/app_gen/conversationHistory/index.ts",
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
        SUGURES_ENDPOINT: contextProps.suguresEndpoint,
        SUGURES_CLIENT_ID: contextProps.suguresClientId,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    });
    secretsStack.azureSecret.grantRead(appGen_conversationHistoryLambda);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(appGen_conversationHistoryLambda);
    parameterStack.aa4kConstParameter.grantRead(appGen_conversationHistoryLambda);
    restapi_portal_app_gen.addResource("conversation_history").addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(appGen_conversationHistoryLambda),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        authorizer: portalAuth,
      }
    });

    // appGen_langchainLogLambda
    const appGen_langchainLogLambda = new nodelambda.NodejsFunction(this, "AppGen_LangchainLogLambda", {
      description: "Langchain実行ログ登録API",
      entry: __dirname + "/lambda/api/portal/app_gen/langchainLog/index.ts",
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
    secretsStack.azureSecret.grantRead(appGen_langchainLogLambda);
    if (auroraStack.dbAdminSecret) auroraStack.dbAdminSecret.grantRead(appGen_langchainLogLambda)
    restapi_portal_app_gen.addResource("langchain_log").addMethod("POST", new apigateway.LambdaIntegration(appGen_langchainLogLambda), {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: portalAuth,
    })


  }
}
