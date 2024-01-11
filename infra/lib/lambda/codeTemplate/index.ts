import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { retrieveHandler } from './retrieveHandler';
import { insertHandler } from './insertHandler';
import { updateHandler } from './updateHandler';
import { deleteHandler } from './deleteHandler';

const app = express();

app.post('/retrieve', retrieveHandler);

// TODO: 下記は管理用APIなので公開時にセキュリティ考慮が必要
app.post('/insert', insertHandler);
app.post('/update', updateHandler);
app.post('/delete', deleteHandler);

export const handler = serverlessExpress({ app })
