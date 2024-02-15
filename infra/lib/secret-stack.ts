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
        // TODO: AA4k用のAzureOpeAIへの切り替え
        secretStringTemplate: JSON.stringify({
          azureOpenAIApiInstanceName: "kintone-copilot-demo",
          azureOpenAIApiDeploymentName: "chat-default",
          azureOpenAIApiVersion: "2023-07-01-preview",
          azureOpenAIEmbeddingApiDeploymentName: "embedding-default",
          azureOpenAIEmbeddingApiVersion: "2023-05-15",
        }),
        generateStringKey: 'azureOpenAIApiKey',
      },
      secretName: `${stageName}/AzureOpenAISecret`
    });
  }
}
