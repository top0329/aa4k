// src/hooks/useTextSpeech.ts

import { useEffect, useRef, useState } from "react";
import { split } from "sentence-splitter";
import { getSubDomain } from "~/util/getSubDomain"
import { KintoneProxyResponse, SpeechResponseBody } from "~/types/apiInterfaces";

/**
 * 音声を出力するカスタムフック
 * 
 * @param aiAnswer - 出力する音声のテキスト
 * @param setAiAnswer - 出力するテキストを更新するセット関数
 * @param finishAiAnswer - 音声出力の完了を判別するフラグ
 * 
 * @returns
 *   setDisable - 音声出力を無効にするセット関数
 *   isSpeech - 音声出力中かどうかを示すフラグ
 */
export const useTextSpeech = (
  aiAnswer: string,
  setAiAnswer: React.Dispatch<React.SetStateAction<string>>,
  finishAiAnswer: boolean,
) => {
  // 音声出力を無効にするフラグ
  const [disable, setDisable] = useState<boolean>(false);
  // 音声出力中かどうかのフラグ（フック全体）
  const [isSpeech, setIsSpeech] = useState<boolean>(false);
  // 現在の音声テキストを保持するRef
  const speechText = useRef<string>("");
  // 読み上げを行う文章を文章として区切った形で格納しておくRef
  const sentences = useRef<string[]>([]);
  // 音声出力中かどうかのフラグ（個々の音声ファイルの再生状態）
  const audioPlaying = useRef<boolean>(false);
  // 再生中の音声を保持するRef
  const sound = useRef<HTMLAudioElement | undefined>();

  // sentencesにAI回答の文字列を文章単位で区切って追加
  useEffect(() => {
    if (disable) return;
    setIsSpeech(true);
    speechText.current += aiAnswer;
    split(speechText.current).forEach((node) => {
      // 読み上げすべき文かどうかの判定
      const isCompleteSentence =
        node?.type === "Sentence" &&
        node.children[0].type === "Str" &&
        (node.children.length >= 2 || finishAiAnswer);

      if (isCompleteSentence) {
        sentences.current = [...sentences.current, node.raw];
        speechText.current = speechText.current.replace(node.raw, "");
      } else if (split(speechText.current).length > 1) {
        speechText.current = speechText.current.replace(node.raw, "");
      }
      setAiAnswer("");
    });
  }, [speechText.current, disable, aiAnswer, finishAiAnswer]);

  // sentencesから文章を1つずつ取り出して順番に再生するのを繰り返すIntervalを設定する
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (disable) return;
      if (audioPlaying.current) return; // 音声再生中に別音声が被ってこないようにする
      if (sentences.current.length === 0) return;

      const sentence = sentences.current.shift();
      if (!sentence) return;

      audioPlaying.current = true;
      const resSpeech = (await kintone.proxy(
        `${import.meta.env.VITE_API_ENDPOINT}/portal/com/speech`,
        "POST",
        {
          // @ts-ignore __NPM_PACKAGE_VERSION__はvite.config.tsで定義
          "aa4k-portal-js-version": __NPM_PACKAGE_VERSION__,
          'aa4k-subdomain': getSubDomain(),
        },
        { text: sentence },
      )) as KintoneProxyResponse;
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
    setDisable,
    isSpeech,
  };
};
