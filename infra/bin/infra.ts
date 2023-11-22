#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ContextProps } from '../lib/type';
import { Aa4kApiStack } from '../lib/api-stack';
import { Aa4kSecretsStack } from '../lib/secret-stack';
import { AuroraStack } from '../lib/aurora-stack';

const app = new cdk.App();
const stageName = app.node.tryGetContext('environment');
const context = app.node.tryGetContext(stageName);
const envName = context.envName;

const contextProps: ContextProps = {
  stageName: stageName,
  envName: envName,
}

const secretsStack = new Aa4kSecretsStack(app, `Aa4k-SecretsStack-${envName}`, contextProps)
const auroraStack = new AuroraStack(app, `Aa4k-AuroraStack-${envName}`, contextProps)

new Aa4kApiStack(app, `Aa4k-ApiStack-${envName}`, contextProps, secretsStack, auroraStack, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
cdk.Tags.of(app).add("Department", "CS");
cdk.Tags.of(app).add("Production", "KINTONE-COPILOT");
// cdk.Tags.of(app).add("Production", "Associate-AIHub-for-kintone");

