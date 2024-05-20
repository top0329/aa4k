import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { retrieveHandler } from './retrieve';

const app = express();

app.post('/retrieve', retrieveHandler);

export const handler = serverlessExpress({ app })
