import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { insertHandler } from './insert';

const app = express();

app.post('/insert', insertHandler);

export const handler = serverlessExpress({ app });