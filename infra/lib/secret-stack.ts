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
        // AA4k用のAzureOpeAIへの切り替え
        // 注意：[azureOpenAIEmbeddingApiDeploymentName]は以下のOpenAIのモデル名と同じ名前でデプロイを作成して使用すること
        // https://platform.openai.com/docs/models/embeddings
        secretStringTemplate: JSON.stringify({
          azureApiManagementEndpoint: contextProps.apiManagementEndpoint,
          azureOpenAIApiInstanceName: contextProps.openAIApiInstanceName,
          azureOpenAIApiDeploymentName: "gpt-4o-global",  // モデルを変更する場合はここを修正
          azureOpenAIApiVersion: "2024-02-15-preview",
          azureOpenAIEmbeddingApiDeploymentName: "text-embedding-3-large",
          azureOpenAIEmbeddingApiVersion: "2023-05-15",
        }),
        generateStringKey: 'azureOpenAIApiKey',
      },
      secretName: `${stageName}/AzureOpenAISecret`
    });
  }
}
