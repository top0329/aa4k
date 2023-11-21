// ***************
// まずはガワだけ作成、後続のタスクで中身を実装予定
// ***************

import serverlessExpress from '@vendia/serverless-express';
import { Response, Request } from "express"
import { PollyClient, SynthesizeSpeechCommand, Engine, VoiceId } from "@aws-sdk/client-polly";
import express = require('express');

const app = express();

interface SpeechRequestBody {
  text: string
}

app.post('/text', async (req: Request, res: Response) => {
  try {
    const { text } = JSON.parse(req.body) as SpeechRequestBody;
    const pollyClient = new PollyClient();
    const command = new SynthesizeSpeechCommand({
      OutputFormat: "mp3",
      Text: text,
      VoiceId: VoiceId.Tomoko,
      Engine: Engine.NEURAL,
    });
    const data = await pollyClient.send(command);
    if (!data.AudioStream) throw new Error("data.AudioStream is not found")
    const audioStream = await data.AudioStream.transformToString("base64")
    res.status(200).json({ data: audioStream })
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Error', message: 'Internal server error' });
  }
});

export const handler = serverlessExpress({ app })
