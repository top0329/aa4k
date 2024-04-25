import { createProxyMiddleware } from 'http-proxy-middleware';
import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import cors = require('cors');
import { getSecretValue, AzureSecretValue } from '../utils'

const app = express();

app.use(cors());
app.use(
  async (_, res, next) => {
    const azureSecretName = process.env.AZURE_SECRET_NAME ? process.env.AZURE_SECRET_NAME : "";
    const azureSecret = await getSecretValue<AzureSecretValue>(azureSecretName)
    res.locals.apiManagementEndpoint = azureSecret.azureApiManagementEndpoint
    res.locals.apiKey = azureSecret.azureOpenAIApiKey
    res.locals.apiDeploymentName = azureSecret.azureOpenAIApiDeploymentName
    res.locals.apiVersion = azureSecret.azureOpenAIApiVersion
    next()
  }
);

app.use(async (req, res, next) => {
  // 以前のミドルウェアで設定された res.locals の値を取得
  const apiManagementEndpoint = res.locals.apiManagementEndpoint;
  const apiKey = res.locals.apiKey;
  const apiDeploymentName = res.locals.apiDeploymentName;
  const apiVersion = res.locals.apiVersion;

  // プロキシの設定を動的に生成
  const proxy = createProxyMiddleware({
    target: `https://${apiManagementEndpoint}/openai/deployments/${apiDeploymentName}`,
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