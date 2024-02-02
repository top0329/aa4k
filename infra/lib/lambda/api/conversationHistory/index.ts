import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { listHandler } from './list';
import { insertHandler } from './insert';

const app = express();

app.post('/list', listHandler);
app.post('/insert', insertHandler);

export const handler = serverlessExpress({ app });