import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class Aa4kSecretsStack extends cdk.Stack {
  readonly azureSecret: secretsmanager.Secret;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const envKey = this.node.tryGetContext('environment');
    const context = this.node.tryGetContext(envKey);
    const envName = context.envName;

    this.azureSecret = new secretsmanager.Secret(this, 'AzureOpenAISecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'azureOpenAIApiKey',
      },
      secretName: `${envName}/AzureOpenAISecret`
    });
  }
}
