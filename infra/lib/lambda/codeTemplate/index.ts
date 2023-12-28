import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { retrieveHandler } from './documents/retrieveHandler';
import { insertHandler } from './documents/insertHandler';
import { updateHandler } from './documents/updateHandler';
import { deleteHandler } from './documents/deleteHandler';

const app = express();

app.post('/documents/retriever', retrieveHandler);
app.post('/documents/insert', insertHandler);
app.post('/documents/update', updateHandler);
app.post('/documents/delete', deleteHandler);

export const handler = serverlessExpress({ app })
