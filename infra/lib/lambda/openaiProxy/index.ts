import { createProxyMiddleware } from 'http-proxy-middleware';
import serverlessExpress from '@vendia/serverless-express';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import express = require('express');
import cors = require('cors');

const app = express();

app.use(cors());
app.use(
  async (_, res, next) => {
    const azure_secret_name = process.env.AZURE_SECRET_NAME;
    const client = new SecretsManagerClient({});
    const azureSecret = await client.send(
      new GetSecretValueCommand({
        SecretId: azure_secret_name,
      })
    )
    if (!azureSecret.SecretString) return next()
    const { azureOpenAIApiKey, azureOpenAIApiInstanceName, azureOpenAIApiDeploymentName, azureOpenAIApiVersion } = JSON.parse(azureSecret.SecretString)
    res.locals.apiKey = azureOpenAIApiKey
    res.locals.apiInstanceName = azureOpenAIApiInstanceName
    res.locals.apiDeploymentName = azureOpenAIApiDeploymentName
    res.locals.apiVersion = azureOpenAIApiVersion
    next()
  }
);

app.use(async (req, res, next) => {
  // 以前のミドルウェアで設定された res.locals の値を取得
  const apiInstanceName = res.locals.apiInstanceName;
  const apiKey = res.locals.apiKey;
  const apiDeploymentName = res.locals.apiDeploymentName;
  const apiVersion = res.locals.apiVersion;

  // プロキシの設定を動的に生成
  const proxy = createProxyMiddleware({
    target: `https://${apiInstanceName}.openai.azure.com/openai/deployments/${apiDeploymentName}`,
    pathRewrite: (path) => path + `?api-version=${apiVersion}`,
    changeOrigin: true,
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('api-key', apiKey);
    }
  });

  // 生成したプロキシミドルウェアを実行
  return proxy(req, res, next);
});

export const handler = serverlessExpress({ app })