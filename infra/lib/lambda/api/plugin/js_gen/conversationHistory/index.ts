import serverlessExpress from '@vendia/serverless-express';
import express = require('express');
import { listHandler } from './list';
import { insertHandler } from './insert';
import { updateUserRatingHandler } from './updateUserRating';
import { clearHandler } from './clear';

const app = express();

app.post('/list', listHandler);
app.post('/insert', insertHandler);
app.post('/update-user-rating', updateUserRatingHandler);
app.post('/clear', clearHandler);

export const handler = serverlessExpress({ app });