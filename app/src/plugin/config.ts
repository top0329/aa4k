((PLUGIN_ID: string) => {

  // プラグインの設定情報を取得する
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);

  // 入力elementを取得
  const elmSubscriptionId = document.getElementById('subscription-id') as HTMLInputElement | null;
  const elmOpenaiApiKey = document.getElementById('openai-api-key') as HTMLInputElement | null;

  if (!elmSubscriptionId || !elmOpenaiApiKey) throw "サブスクリプションIDとOpenAI APIキーのHTML要素が存在しません";

  // 設定値（config.text）にすでに値が入ってたら、config.htmlの設定値入力欄にその値を入れる
  if (config.subscriptionId) {
    elmSubscriptionId.value = config.subscriptionId;
  }
  if (config.openaiApiKey) {
    elmOpenaiApiKey.value = config.openaiApiKey;
  }

  /**
   * config.htmlの[保存]ボタン押下
   *     プラグインに設定値入力欄の値を保存
   */
  document.getElementById("submit")!.onclick = async function () {
    const config = {
      subscriptionId: elmSubscriptionId.value,
      openaiApiKey: elmOpenaiApiKey.value,
    }

    // OpenAI APIキーのチェック
    if (config.openaiApiKey) {
      const openAiCheckBody = {
        "model": "gpt-4-1106-preview",  // TODO: モデルも.envにしたい
        "messages": [{ "role": "user", "content": "Hello!" }]
      }
      const [, resStatus,] = await kintone.proxy(
        "https://api.openai.com/v1/models",
        "POST",
        { 'Content-Type': 'application/json', Authorization: `Bearer ${config.openaiApiKey}`, },
        openAiCheckBody,
      );
      if (resStatus !== 200) {
        alert('入力されたOpenAI APIキーはご利用できません。正しい情報が入力されていることをご確認ください');
        return;
      }
    }

    // AA4k本体での外部API連携時に、[プラグインバージョン][サブスクリプションID][OpenAI APIキー]を秘匿して連携するためsetProxyConfigに設定
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT
    const openaiProxyApiEndpoint = import.meta.env.VITE_OPENAI_PROXY_API_ENDPOINT
    const header = {
      // @ts-ignore __NPM_PACKAGE_VERSION__はvite.plugin.config.tsで定義
      "aa4k-plugin-version": __NPM_PACKAGE_VERSION__,
      "aa4k-subscription-id": config.subscriptionId,
      "aa4k-api-key": config.openaiApiKey,
    };
    kintone.plugin.app.setProxyConfig(apiEndpoint, 'POST', header, {}, function () {
      kintone.plugin.app.setProxyConfig(openaiProxyApiEndpoint, 'POST', header, {}, function () {
        // 設定画面で入力された情報の保存
        kintone.plugin.app.setConfig(config);
      });
    });
  };


  /**
   * config.htmlの[キャンセル]ボタン押下
   */
  document.getElementById("cancel")!.onclick = function () {
    history.back();
  };
})(`${kintone.$PLUGIN_ID}`);