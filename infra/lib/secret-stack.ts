import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { ContextProps } from '../lib/type';

export class Aa4kSecretsStack extends cdk.Stack {
  readonly azureSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, contextProps: ContextProps, props?: cdk.StackProps) {
    super(scope, id, props);
    const stageName = contextProps.stageName;

    // Azure OpenAI service Secret
    this.azureSecret = new secretsmanager.Secret(this, 'AzureOpenAISecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'azureOpenAIApiKey',
      },
      secretName: `${stageName}/AzureOpenAISecret`
    });
  }
}
