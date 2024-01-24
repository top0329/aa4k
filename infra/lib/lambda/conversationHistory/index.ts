import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { listHandler } from './listHandler';
import { insertHandler } from './insertHandler';

const app = express();

app.post('/list', listHandler);
app.post('/insert', insertHandler);

export const handler = serverlessExpress({ app });