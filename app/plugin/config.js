(function (PLUGIN_ID) {
  'use strict';

  console.log(`PLUGIN_ID: ${PLUGIN_ID}`);
  //config.htmlの設定値入力欄オブジェクトを取得する
  let set_text = document.getElementById('set_text');

  //プラグインIDを設定する
  let config = kintone.plugin.app.getConfig(PLUGIN_ID);

  //設定値（config.text）にすでに値が入ってたら、
  //config.htmlの設定値入力欄にその値を入れる
  if (config.text) {
    set_text.value = config.text;
  }

  //config.htmlの保存するボタンおしたら
  //プラグインに設定値入力欄の値を保存し
  //メッセージを表示後、アプリ設定画面へ遷移させる
  document.getElementById("submit").onclick = function () {
    kintone.plugin.app.setConfig({ text: set_text.value }, function () {
      alert('プラグインの設定が保存されました！アプリを更新してください！');
      window.location.href = '../../flow?app=' + kintone.app.getId();
    });
  };

  //config.htmlのキャンセルボタンおしたら
  //プラグイン設定画面に遷移させる
  document.getElementById("cancel").onclick = function () {
    window.location.href = '../../' + kintone.app.getId() + '/plugin/';
  };

})(kintone.$PLUGIN_ID);;