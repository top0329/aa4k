import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { retrieveHandler } from './retrieve';
import { insertHandler } from './insert';
import { updateHandler } from './update';
import { deleteHandler } from './delete';

const app = express();

app.post('/retrieve', retrieveHandler);

// TODO: 下記は管理用APIなので公開時にセキュリティ考慮が必要
app.post('/insert', insertHandler);
app.post('/update', updateHandler);
app.post('/delete', deleteHandler);

export const handler = serverlessExpress({ app })
