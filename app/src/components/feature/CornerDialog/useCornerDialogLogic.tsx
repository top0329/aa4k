// src/hooks/useCornerDialogLogic.tsx
import { useAtom } from "jotai";
import { ChatOpenState, DialogOpenState } from "~/components/feature/CornerDialog/CornerDialogState";
import { Conversation } from "~/types/agents";

export const useCornerDialogLogic = () => {
  const [dialogOpen, setDialogOpen] = useAtom(DialogOpenState);
  const [chatOpen] = useAtom(ChatOpenState);
  const onSubmit = (data: { example: string }) => {
    console.log(data);
    // Add your form submission logic here
  };

  // dummy data
  const conversations: Conversation[] = [
    {
      message: {
        role: 'human',
        content: 'Hello, how can I help you?'
      },
      chatHistory: [
        {
          role: 'ai',
          content: 'Hello, I have a problem with my account'
        },
      ],
    },
    {
      message: {
        role: 'human',
        content: 'Hello, how can I help you?'
      },
      chatHistory: [
        {
          role: 'ai',
          content: 'Hello, I have a problem with my account'
        },
      ],
    },
    {
      message: {
        role: 'human',
        content: 'Hello, how can I help you?'
      },
      chatHistory: [
        {
          role: 'ai',
          content: 'Hello, I have a problem with my account'
        },
      ],
    },
    {
      message: {
        role: 'human',
        content: 'Hello, how can I help you?'
      },
      chatHistory: [
        {
          role: 'ai',
          content: 'Hello, I have a problem with my account'
        },
      ],
    },
    {
      message: {
        role: 'human',
        content: '対応予定日が最も過去のレコードの色を変える機能を作って'
      },
      chatHistory: [
        {
          role: 'ai',
          content: `※表示形式や文章表現は画面イメージに合わせて調整する可能性あり
                    対応予定日が最も過去のレコードの色を変える機能を作成しました。

                    ■自動補完説明
                    作成したJavaScriptカスタマイズでは、以下の点を自動で補完しています。
                    1. 背景色は金色（#FFD700）に設定しています。

                    ■修正指示例
                    1. 背景色を変更したい場合は、「背景色を青色に変更してください」と指示してください。

                    ■ガイドライン違反
                    1. 大量のリクエスト送信を避けるべきですが、オリジナルコードでは500回のAPIリクエストを行っています。これはサービスのレスポンス悪化やアクセス制限の原因になる可能性があります。
                    2. エラーハンドリングが不十分です。catchブロックでエラーをキャッチしていますが、その後の処理が適切ではありません。エラーが発生した場合には、ユーザーにわかりやすいメッセージを表示するなどの対応が必要です。
                    ----------------------------------------
                    ■AIの回答（例）の補足説明
                    以下がお客様の質問に対するAIの処理結果の回答
                    対応予定日が最も過去のレコードの色を変える機能を作成しました。
                    以下がお客様の質問に対するAIからの補足回答
                    補足回答には以下を内容を出力する想定
                    自動補完説明：JS生成時にAIが自動補完した内容の説明
                    修正指示例：AIが自動補完した箇所の修正指示例
                    ガイドライン違反：オリジナルソースにガイドライン違反がある場合、注意喚起のメッセージ
          `
        },
      ],
    },
  ];
  return {
    chatOpen,
    dialogOpen,
    setDialogOpen,
    onSubmit,
    conversations,
  };
};
