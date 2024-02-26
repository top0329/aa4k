// src/hooks/useTextSpeech.ts
import { useEffect, useRef, useState } from "react";
import { split } from "sentence-splitter";
import { SpeechResponseBody, KintoneProxyResponse } from '~/types/apiResponse';

export const useTextSpeech = (
  aiAnswerRef: React.MutableRefObject<string>,
  finishAiAnswerRef: React.MutableRefObject<boolean>,
) =>{
  const [isSpeech, setIsSpeech] = useState<boolean>(false);
  // Ref
  const speechText = useRef<string>("");
  const sentences = useRef<string[]>([]);   // 読み上げを行う文章を文章として区切った形で格納しておくRef
  const audioPlaying = useRef<boolean>(false);
  const sound = useRef<HTMLAudioElement | undefined>();

  // sentencesにAI回答の文字列を文章単位で区切って追加
  useEffect(() => {
    setIsSpeech(true);
    speechText.current += aiAnswerRef.current;
    split(speechText.current).forEach((node) => {
      // 読み上げすべき文かどうかの判定
      const isCompleteSentence =
        node?.type === "Sentence" &&
        node.children[0].type === "Str" &&
        (node.children.length >= 2 || finishAiAnswerRef.current);

      if (isCompleteSentence) {
        sentences.current = [...sentences.current, node.raw];
        speechText.current = speechText.current.replace(node.raw, "");
      } else if (split(speechText.current).length > 1) {
        speechText.current = speechText.current.replace(node.raw, "");
      }
      aiAnswerRef.current = "";
    });
  }, [
    speechText.current,
    aiAnswerRef.current,
    finishAiAnswerRef.current,
  ]);

  // sentencesから文章を1つずつ取り出して順番に再生するのを繰り返すIntervalを設定する
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (audioPlaying.current) return; // 音声再生中に別音声が被ってこないようにする
      if (sentences.current.length === 0) return;

      const sentence = sentences.current.shift();
      if (!sentence) return;

      audioPlaying.current = true;
      const resSpeech = await kintone.proxy(
        `${import.meta.env.VITE_API_ENDPOINT}/speech`,
        "POST",
        { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
        { text: sentence },
      ) as KintoneProxyResponse;
      const [resBody] = resSpeech;
      const resJsonSpeech = JSON.parse(resBody) as SpeechResponseBody;
      sound.current = new Audio(`data:audio/mp3;base64,${resJsonSpeech.data}`);
      await sound.current.play();
      while (sound.current && !sound.current.ended) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      audioPlaying.current = false;
      if (sentences.current.length === 0) {
        setIsSpeech(false);
      }
    }, 500);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    return () => {
      // 音声再生を停止する
      if (sound.current) {
        sound.current.pause();
        sound.current = undefined;
      }
    };
  }, []);

  return {
    isSpeech,
  };
}