#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ContextProps } from '../lib/type';
import { Aa4kApiStack } from '../lib/api-stack';
import { Aa4kSecretsStack } from '../lib/secret-stack';
import { AuroraStack } from '../lib/aurora-stack';
import { Aa4kElastiCacheStack } from '../lib/elasticache-stack';
import { Aa4kParameterStack } from '../lib/parameter-stack';

const app = new cdk.App();
const stageKey = app.node.tryGetContext('environment');
const context = app.node.tryGetContext(stageKey);
const stageName = context.stageName;

const contextProps: ContextProps = {
  stageKey: stageKey,
  stageName: stageName,
  deletionProtection: stageName === "prod" ? true : false,
  cacheNodeType: stageName === "prod" ? "cache.m7g.large" : "cache.t4g.micro",
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
cdk.Tags.of(app).add("Department", "CS");
cdk.Tags.of(app).add("Production", "AA4K");

