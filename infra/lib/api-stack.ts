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

export class Aa4kApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, contextProps: ContextProps, secretsStack: Aa4kSecretsStack, auroraStack: AuroraStack, props?: cdk.StackProps) {
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
      securityGroups: [auroraStack.auroraAccessableSG],
      environment: {
        DB_ACCESS_SECRET_NAME: auroraStack.dbAdminSecret.secretName
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    })
    const lambdaAuthorizer = new apigateway.RequestAuthorizer(this, 'Authorizer', {
      handler: authorizerFunction,
      identitySources: [apigateway.IdentitySource.header('system_key')]
    });
    auroraStack.dbAdminSecret.grantRead(authorizerFunction)

    // ******************************
    // Lambda関数
    // ******************************
    // codeTemplate Lambda
    const codeTemplateLambda = new nodelambda.NodejsFunction(this, "CodeTemplateLambda", {
      entry: __dirname + "/lambda/codeTemplate/index.ts",
      handler: "handler",
      vpc: auroraStack.vpc,
      securityGroups: [auroraStack.auroraAccessableSG],
      environment: {
        AZURE_SECRET_NAME: secretsStack.azureSecret.secretName,
        DB_ACCESS_SECRET_NAME: auroraStack.dbAdminSecret.secretName,
      },
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.NODEJS_20_X
    })
    secretsStack.azureSecret.grantRead(codeTemplateLambda)
    auroraStack.dbAdminSecret.grantRead(codeTemplateLambda)
    restapi.root.addResource("code_template").addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(codeTemplateLambda),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        authorizer: lambdaAuthorizer,
      }
    })
  }
}
