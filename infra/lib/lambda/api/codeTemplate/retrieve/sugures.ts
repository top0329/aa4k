import Redis from 'ioredis';
import { Document } from "@langchain/core/documents";
import { BaseRetriever, BaseRetrieverInput } from "@langchain/core/retrievers"
import { SuguresPostbackPrefix, SuguresMessageType } from "../../../utils/sendSugures/constants"
import {
  getRedisConfig,
  sendSuguresMessage,
  sendSuguresPostback,
  SuguresChoicesMessage,
  SuguresPostbackResultRow,
} from "../../../utils"

// スグレス側の設定 ========================
// --------------------
// [メッセージ設定] -> [FAQ]
//    pleaseChoose: [PLEASE_CHOOSE]
//    notApplicable: [NOT_APPLICABLE]
//    notFound: [NOT_FOUND]
//    askIfHelpful: [ASK_IF_HELPFUL]
// --------------------
// [その他設定] -> [オプション機能]
//    直接回答: チェックあり
//    質問合致確認: チェックなし
//    インテントFAQ検索: チェックなし
//    サジェスト機能(Web): チェックなし
// --------------------
// ========================================
const NOT_FOUND_WORD = "NOT_FOUND" as const;  // 該当なしのワード
const NOT_APPLICABLE_WORD = "NOT_APPLICABLE" as const;  // 検索結果（複数）のうち「該当するものがありません」の選択肢のワード
const ASK_IF_HELPFUL_WORD = "ASK_IF_HELPFUL" as const;  // 解決確認のワード
const PLEASE_CHOOSE_WORD = "PLEASE_CHOOSE" as const;

/**
 * スグレスレトリバー
 */
export class SuguresRetriever extends BaseRetriever {
  subscriptionId: string;
  conversationId: string;

  get lc_namespace() {
    return ["langchain", "retrievers", "base"];
  }
  constructor(subscriptionId: string, conversationId: string, fields?: BaseRetrieverInput) {
    super(fields);
    this.subscriptionId = subscriptionId;
    this.conversationId = conversationId;
  };
  async getRelevantDocuments(query: string): Promise<Document[]> {
    const suguresDocuments = await this.getSuguresDocuments(query, this.subscriptionId, this.conversationId);
    return suguresDocuments;
  }

  /**
   * スグレス連携
   * @param query 
   * @returns 
   */
  async getSuguresDocuments(query: string, subscriptionId: string, conversationId: string): Promise<Document[]> {
    try {
      const sessionId = crypto.randomUUID()
      const suguresEndpoint = process.env.SUGURES_ENDPOINT;
      const suguresClientId = process.env.SUGURES_CLIENT_ID;
      const suguresMessageUrl = `${suguresEndpoint}/${suguresClientId}/message`;
      const suguresPostbackUrl = `${suguresEndpoint}/${suguresClientId}/postback`;

      // ------------------------------
      // スグレス連携
      // ------------------------------
      const result = await sendSuguresMessage(suguresMessageUrl, query, subscriptionId, sessionId);
      const messages = result.messages;

      // ------------------------------
      // 結果編集
      // ------------------------------
      if (messages[0].type == SuguresMessageType.text
        && messages[0].text === NOT_FOUND_WORD
      ) {
        // --------------------
        // 該当なしの場合
        // (例)
        // {
        //   id: '36207755-78a0-414a-9661-fdacfcbfe3be',
        //   messages: [
        //     { type: 'text', text: 'NOT_FOUND' },
        //     { type: 'text', text: '他にもお困りごとやご質問などはございますでしょうか？' }
        //   ]
        // }
        // --------------------
        return [];

      } else if (messages[0].type == SuguresMessageType.text
        && messages[1]
        && messages[1].type === SuguresMessageType.text
        && messages[1].text === ASK_IF_HELPFUL_WORD
      ) {
        // --------------------
        // 回答が1件の場合
        // (例)
        // {
        //   id: '313c94cf-319e-4012-8a26-755798e55fda',
        //   messages: [
        //     { type: 'text', text: '{応答文}' },
        //     { type: 'text', text: 'ASK_IF_HELPFUL' },
        //     { type: 'confirm', yes: [Object], no: [Object] }
        //   ]
        // }
        // --------------------
        let resultDocuments: Document[] = [];
        let wasHelpfulPostbackKeys: string[] = [];
        let wasNotHelpfulPostbackKeys: string[] = [];

        messages
          .filter((message) => !(message.type === SuguresMessageType.text && message.text === ASK_IF_HELPFUL_WORD))  // 解決確認を除外
          .forEach((message) => {
            if (message.type === SuguresMessageType.text) {
              // 1件の回答をDocument(retriever)として使用するため格納
              resultDocuments.push(new Document(JSON.parse(message.text)))
            } else if (message.type === SuguresMessageType.confirm) {
              // ポストバック送信するため解決確認のkeyを配列に格納
              wasHelpfulPostbackKeys.push(message.yes.key)
              wasNotHelpfulPostbackKeys.push(message.no.key)
            }
          })
        // 格納された解決確認のkeyをRedisに保存（非同期処理）
        this.suguresWasHelpfulPostback(wasHelpfulPostbackKeys, wasNotHelpfulPostbackKeys, subscriptionId, conversationId, sessionId)
        // 格納されたDocument(retriever)を返却
        return resultDocuments;

      } else if (messages[0].type == SuguresMessageType.text
        && messages[0].text === PLEASE_CHOOSE_WORD
        && messages[1]
        && messages[1].type == SuguresMessageType.choices
      ) {
        // --------------------
        // 回答が複数件の場合
        // (例)
        // {
        //   id: '10a993da-bd88-485b-a3cc-68efdf9b0a2f',
        //   messages: [
        //     { type: 'text', text: 'PLEASE_CHOOSE_WORD' },
        //     { type: 'choices', actions: [Array] }
        //   ]
        // }
        // actions: [
        //   { type: 'postback', label: 'カタカナをひらがなに変換する', key: 'Postback_7a1cdbef-c4b4-4b2e-b76b-9bd37dd6fbfd_test_fe76e900-1a19-49b7-bc69-7e404a475ed1' },
        //   { type: 'postback', label: 'ひらがなをカタカナに変換する', key: 'Postback_7a1cdbef-c4b4-4b2e-b76b-9bd37dd6fbfd_test_f5b338e4-09a6-4f83-adc1-482c84762bdd' },
        //   { type: 'postback', label: 'NOT_APPLICABLE', key: 'Postback_7a1cdbef-c4b4-4b2e-b76b-9bd37dd6fbfd_test_89a50a44-d65c-4196-8f89-e5810dd6a8d2' }
        // ]
        // ※各actionのkeyをpostback送信した結果は、上記の「回答が1件の場合」と同じ
        // --------------------
        const choicesMessages = messages[1] as SuguresChoicesMessage;
        const actions = choicesMessages.actions;
        // actionの全てのポストバックを送信して、応答内容を取得([NOT_APPLICABLE]を除く)
        const postbackResponses = await Promise.all(
          actions
            .filter(obj => obj.label !== NOT_APPLICABLE_WORD)
            .map((obj) => sendSuguresPostback(suguresPostbackUrl, obj.key, subscriptionId, sessionId))
        );

        let resultDocuments: Document[] = [];
        let wasHelpfulPostbackKeys: string[] = [];
        let wasNotHelpfulPostbackKeys: string[] = [];

        // Promise.allの結果
        for (const postbackResponse of postbackResponses) {
          const messages = postbackResponse.messages;
          messages
            .filter((message) => !(message.type === SuguresMessageType.text && message.text === ASK_IF_HELPFUL_WORD))  // 解決確認を除外
            .forEach((message) => {
              if (message.type === SuguresMessageType.text) {
                // 1件の回答をDocument(retriever)として使用するため格納
                resultDocuments.push(new Document(JSON.parse(message.text)))
              } else if (message.type === SuguresMessageType.confirm) {
                // ポストバック送信するため解決確認のkeyを配列に格納
                wasHelpfulPostbackKeys.push(message.yes.key)
                wasNotHelpfulPostbackKeys.push(message.no.key)
              }
            })
        }
        // 格納された解決確認のkeyをRedisに保存（非同期処理）
        this.suguresWasHelpfulPostback(wasHelpfulPostbackKeys, wasNotHelpfulPostbackKeys, subscriptionId, conversationId, sessionId)
        // 格納されたDocument(retriever)を返却
        return resultDocuments;
      } else {
        return [];
      }
    } catch (err) {
      return [];
    }
  }

  /**
   * HelpfulのkeyをRedisに保存
   * @param wasHelpfulPostbackKeys 
   * @param wasNotHelpfulPostbackKeys 
   * @param subscriptionId 
   * @param conversationId 
   */
  async suguresWasHelpfulPostback(wasHelpfulPostbackKeys: string[], wasNotHelpfulPostbackKeys: string[], subscriptionId: string, conversationId: string, sessionId: string) {
    let redisClient: Redis | undefined;
    try {
      // redis接続情報
      const redisConfig = getRedisConfig();
      // redis接続
      redisClient = new Redis(redisConfig);

      const setValue = {
        sessionId: sessionId,
        wasHelpfulPostbackKeys: JSON.stringify(wasHelpfulPostbackKeys),
        wasNotHelpfulPostbackKeys: JSON.stringify(wasNotHelpfulPostbackKeys),
      } as SuguresPostbackResultRow;
      // Redisキー
      const redisKey = `${SuguresPostbackPrefix}_${subscriptionId}_${conversationId}`;
      await redisClient.hmset(redisKey, setValue);
      // 有効期限を1日(86400秒)で設定
      await redisClient.expire(redisKey, 86400);

    } finally {
      if (redisClient) {
        // Redis接続を閉じる
        redisClient.quit();
      }
    }
  }

}



