import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { getCodeHandler } from './getCodeHandler';

const app = express();

app.post('/get-code', getCodeHandler);

export const handler = serverlessExpress({ app });