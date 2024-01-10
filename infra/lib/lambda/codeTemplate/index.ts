import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { retrieveHandler } from './retrieveHandler';
import { insertHandler } from './insertHandler';
import { updateHandler } from './updateHandler';
import { deleteHandler } from './deleteHandler';

const app = express();

app.post('/retriever', retrieveHandler);
app.post('/insert', insertHandler);
app.post('/update', updateHandler);
app.post('/delete', deleteHandler);

export const handler = serverlessExpress({ app })
