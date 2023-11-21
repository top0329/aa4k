import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as nodelambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Aa4kSecretsStack } from './secret-stack'
import { AuroraStack } from './aurora-stack'
import * as settings from './settings'
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

export class Aa4kInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const envKey = this.node.tryGetContext('environment');
    const context = this.node.tryGetContext(envKey);
    const envName = context.envName;

    const secrets = new Aa4kSecretsStack(this, "SecretsStack")
    const auroraStack = new AuroraStack(this, "AuroraStack")

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

    const restapi = new apigateway.RestApi(this, `Aa4k-${envName}-RestAPI`, {
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
    const webAcl = new cdk.aws_wafv2.CfnWebACL(this, "wafV2WebAcl", {
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
      securityGroups: [auroraStack.securityGroup],
      environment: {
        DB_ACCESS_SECRET_NAME: auroraStack.dbSecretName
      },
      timeout: cdk.Duration.seconds(300),
    })
    const lambdaAuthorizer = new apigateway.RequestAuthorizer(this, 'Authorizer', {
      handler: authorizerFunction,
      identitySources: [apigateway.IdentitySource.header('system_key')]
    });

    // ******************************
    // Lambda関数
    // ******************************
    // codeTemplate Lambda
    const codeTemplateLambda = new nodelambda.NodejsFunction(this, "CodeTemplateLambda", {
      entry: __dirname + "/lambda/codeTemplate/index.ts",
      handler: "handler",
      vpc: auroraStack.vpc,
      securityGroups: [auroraStack.securityGroup],
      environment: {
        AZURE_SECRET_NAME: secrets.azureSecret.secretName,
        DB_ACCESS_SECRET_NAME: auroraStack.dbSecretName
      },
      timeout: cdk.Duration.seconds(300),
    })
    secrets.azureSecret.grantRead(codeTemplateLambda)
    restapi.root.addResource("codeTemplate").addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(codeTemplateLambda),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        authorizer: lambdaAuthorizer,
      }
    })
  }
}
