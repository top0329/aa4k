#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ContextProps } from '../lib/type';
import { Aa4kApiStack } from '../lib/api-stack';
import { Aa4kApiAiProxyStack } from '../lib/api-openai-proxy-stack';
import { Aa4kSecretsStack } from '../lib/secret-stack';
import { AuroraStack } from '../lib/aurora-stack';
import { Aa4kElastiCacheStack } from '../lib/elasticache-stack';
import { Aa4kParameterStack } from '../lib/parameter-stack';

const app = new cdk.App();
const stageKey = app.node.tryGetContext('environment');
const context = app.node.tryGetContext(stageKey);
const stageName = context.stageName;
// スグレス接続情報
const SUGURES_ENDPOINT_STG = "https://message-stage.sugures.app";
const SUGURES_CLIENT_ID_STG = "7a1cdbef-c4b4-4b2e-b76b-9bd37dd6fbfd";
const SUGURES_ENDPOINT_PROD = "https://message.sugures.app";
const SUGURES_CLIENT_ID_PROD = "xxxxxxxxxxxx";

const contextProps: ContextProps = {
  stageKey: stageKey,
  stageName: stageName,
  deletionProtection: stageName === "prod" ? true : false,
  cacheNodeType: stageName === "prod" ? "cache.m7g.large" : "cache.t4g.micro",
  suguresEndpoint: stageName === "prod" ? SUGURES_ENDPOINT_PROD : SUGURES_ENDPOINT_STG,
  suguresClientId: stageName === "prod" ? SUGURES_CLIENT_ID_PROD : SUGURES_CLIENT_ID_STG,
}

const stackProps: cdk.StackProps = {
  env: {
    account: "254440508415",
    region: "ap-northeast-1",
  }
}

const secretsStack = new Aa4kSecretsStack(app, `Aa4k-SecretsStack-${stageName}`, contextProps, stackProps)
const auroraStack = new AuroraStack(app, `Aa4k-AuroraStack-${stageName}`, contextProps, stackProps)
const elastiCacheStack = new Aa4kElastiCacheStack(app, `Aa4k-ElastiCacheStack-${stageName}`, contextProps, auroraStack, stackProps)
const parameterStack = new Aa4kParameterStack(app, `Aa4k-ParameterStack-${stageName}`, contextProps, auroraStack, stackProps)

new Aa4kApiStack(app, `Aa4k-ApiStack-${stageName}`, contextProps, secretsStack, auroraStack, elastiCacheStack, parameterStack, stackProps);
new Aa4kApiAiProxyStack(app, `Aa4k-ApiAiProxyStack-${stageName}`, contextProps, secretsStack, auroraStack, elastiCacheStack, parameterStack, stackProps);
cdk.Tags.of(app).add("Department", "CS");
cdk.Tags.of(app).add("Production", "AA4K");

