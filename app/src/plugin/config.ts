import { ModelsPage } from 'openai/resources/models';
import { z } from "zod";

type ResponseHeaders = Record<string, any>;
type KintoneProxyResponse = [string, number, ResponseHeaders];
interface KintoneConfig {
  subscriptionId: string;
  openaiApiKey: string;
  targetModel: string;
};

((PLUGIN_ID: string) => {
  const apiEndpoint: string = import.meta.env.VITE_API_ENDPOINT;
  const openaiProxyApiEndpoint: string = import.meta.env.VITE_OPENAI_PROXY_API_ENDPOINT;
  const openaiApiEndpoint: string = "https://api.openai.com/v1"

  // プラグインの設定情報を取得する
  const config = kintone.plugin.app.getConfig(PLUGIN_ID) as KintoneConfig;

  // 入力elementを取得
  const elmSubmitBtn = document.getElementById('submit') as HTMLInputElement;
  const elmCancelBtn = document.getElementById('cancel') as HTMLInputElement;
  const elmSubscriptionId = document.getElementById('subscription-id') as HTMLInputElement;
  const elmOpenaiApiKey = document.getElementById('openai-api-key') as HTMLInputElement;
  const elmModelSelect = document.getElementById('model-select') as HTMLDivElement;
  const elmGetModelBnt = document.getElementById('get-model') as HTMLInputElement;
  const elmModelList = document.getElementById('model-list') as HTMLSelectElement;

  // [モデル取得]ボタン押下イベントの登録
  elmGetModelBnt.addEventListener("click", getModels);
  // [OpenAI APIキー]変更イベントの登録
  elmOpenaiApiKey.addEventListener("change", () => {
    toggleElementDisplay((elmOpenaiApiKey.value ? true : false), elmModelSelect);
    elmModelList.value = "";
  });
  // [保存]ボタン押下イベントの登録
  elmSubmitBtn.addEventListener("click", submit);
  // [キャンセル]ボタン押下イベントの登録
  elmCancelBtn.addEventListener("click", cancel);

  // 設定値（getConfig）にすでに値が入ってたら、config.htmlの設定値入力欄にその値を入れる
  if (config.subscriptionId) {
    elmSubscriptionId.value = config.subscriptionId
  }

  if (config.openaiApiKey) {
    elmOpenaiApiKey.value = config.openaiApiKey
    // [モデル設定]を表示
    toggleElementDisplay(true, elmModelSelect);
  }
  if (config.targetModel) {
    // モデルが選択済みの場合、再表示のため[モデル取得]ボタンイベントを発火させリスト表示させる
    elmGetModelBnt.click();
  }


  /**
   * 保存処理
   */
  async function submit() {
    const subscriptionId = elmSubscriptionId.value;
    const openaiApiKey = elmOpenaiApiKey.value;
    const targetModel = elmModelList.value;
    // 入力チェック
    if (!validate()) return;

    const config = {
      subscriptionId: subscriptionId,
      openaiApiKey: openaiApiKey,
      targetModel: openaiApiKey ? targetModel : "",
    } as KintoneConfig;
    // AA4k本体での外部API連携時に、[プラグインバージョン][サブスクリプションID][OpenAI APIキー]を秘匿して連携するためsetProxyConfigに設定
    const header = {
      // @ts-ignore __NPM_PACKAGE_VERSION__はvite.plugin.config.tsで定義
      "aa4k-plugin-version": __NPM_PACKAGE_VERSION__,
      "aa4k-subscription-id": subscriptionId,
      "aa4k-api-key": openaiApiKey,
    };
    // トライアル時のOpenAI連携時に[authorization](API Key)を秘匿して連携するためsetProxyConfigに設定
    const openAiHeader = {
      authorization: `Bearer ${openaiApiKey}`
    }
    kintone.plugin.app.setProxyConfig(apiEndpoint, 'POST', header, {}, () => {
      kintone.plugin.app.setProxyConfig(openaiProxyApiEndpoint, 'POST', header, {}, () => {
        kintone.plugin.app.setProxyConfig(`${openaiApiEndpoint}/chat`, 'POST', openAiHeader, {}, () => {
          // 設定画面で入力された情報の保存
          kintone.plugin.app.setConfig(config);
        });
      });
    });
  };


  /**
   * キャンセル処理
   */
  function cancel() {
    history.back();
  };



  /**
   * 表示／非表示の切り替え
   * @param isDisplay true: 表示、false: 非表示
   * @param targetElement ターゲット要素
   */
  function toggleElementDisplay(isDisplay: boolean, targetElement: HTMLElement): void {
    if (isDisplay) {
      // 表示
      targetElement.style.display = "block";
    } else {
      // 非表示
      targetElement.style.display = "none";
    }
  };

  /**
   * モデル一覧の取得・表示
   */
  async function getModels() {
    // OpenAI APIでモデル一覧を取得
    const [resBody, resStatus,] = await kintone.proxy(
      `${openaiApiEndpoint}/models`,
      "GET",
      { Authorization: `Bearer ${elmOpenaiApiKey.value}`, },
      {},
    ) as KintoneProxyResponse;
    if (resStatus !== 200) {
      alert('入力されたOpenAI APIキーはご利用できません。正しい情報が入力されていることをご確認ください');
      return;
    }
    const result = JSON.parse(resBody) as ModelsPage;
    const modelList = result.data

    // 既存のoptionを削除
    elmModelList.innerHTML = '';

    // 新しいoptionを定義 ("gpt-4"が含まれているもので絞り込み)
    const options = modelList
      .filter((obj) => obj.id.includes("gpt-4"))
      .map((obj) => {
        return { text: obj.id, value: obj.id }
      })

    // 新しいoptionをselect要素に追加
    options.forEach((option) => {
      const newOption = document.createElement('option');
      newOption.text = option.text;
      newOption.value = option.value;
      elmModelList.add(newOption);
    });

    // 保存済みの情報で表示
    elmModelList.value = config.targetModel;
  }

  /**
   * バリデーション
   * @param value 
   */
  function validate(): boolean {
    // サブスクリプションIDのチェック
    // ⇒必須チェック
    if (!elmSubscriptionId.value) {
      alert("サブスクリプションIDを入力してください")
      return false;
    }
    // ⇒形式チェック (UUID)
    const uuidSchema = z.string().uuid();
    const result = uuidSchema.safeParse(elmSubscriptionId.value);
    if (!result.success) {
      alert("サブスクリプションIDの形式が正しくありません。正しい情報が入力されていることをご確認ください")
      return false;
    }

    // モデル設定のチェック
    if (elmOpenaiApiKey.value) {
      // OpenAI APIキーが入力されている場合
      if (!elmModelList.value) {
        alert("モデルを選択してください")
        return false;
      }
    }
    return true;
  }
})(`${kintone.$PLUGIN_ID}`);


