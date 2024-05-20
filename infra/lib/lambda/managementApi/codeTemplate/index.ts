import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { insertHandler } from './insert';
import { updateHandler } from './update';
import { deleteHandler } from './delete';

const app = express();

app.post('/insert', insertHandler);
app.post('/update', updateHandler);
app.post('/delete', deleteHandler);

export const handler = serverlessExpress({ app })
