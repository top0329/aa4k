#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ContextProps } from '../lib/type';
import { Aa4kApiStack } from '../lib/api-stack';
import { Aa4kSecretsStack } from '../lib/secret-stack';
import { AuroraStack } from '../lib/aurora-stack';

const app = new cdk.App();
const stageKey = app.node.tryGetContext('environment');
const context = app.node.tryGetContext(stageKey);
const stageName = context.stageName;

const contextProps: ContextProps = {
  stageKey: stageKey,
  stageName: stageName,
  deletionProtection: stageName === "prod" ? true : false,
}

const stackProps: cdk.StackProps = {
  env: {
    account: "254440508415",
    region: "ap-northeast-1",
  }
}

const secretsStack = new Aa4kSecretsStack(app, `Aa4k-SecretsStack-${stageName}`, contextProps, stackProps)
const auroraStack = new AuroraStack(app, `Aa4k-AuroraStack-${stageName}`, contextProps, stackProps)

new Aa4kApiStack(app, `Aa4k-ApiStack-${stageName}`, contextProps, secretsStack, auroraStack, stackProps);
cdk.Tags.of(app).add("Department", "CS");
cdk.Tags.of(app).add("Production", "AA4K");

