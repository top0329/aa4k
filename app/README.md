# AA4k Plugin App

## 環境構築

### パッケージインストール
- `npm i`

### 開発環境サーバー起動
- `npm run dev`


## 開発環境構築

1. 各種ライブラリをインストール
    node_modulesフォルダが作成される
    ```
    npm i
    ```
2. ローカルサーバーの起動
    https://localhost:4173/ でローカルサーバーが立ち上がる
    ```
    npm run preview
    ```
3. desktop.jsのビルド
    アップロード後にdesktop.jsを変更する場合
    dist/src/desktop/desktop.jsが作成される
    ```
    npm run build
    ```
4. config.jsのビルド
    アップロード後にconfig.jsを変更する場合
    dist/src/config/config.jsが作成される
    ```
    npm run build-plugin
    ```
5. 各アプリでプラグインを導入
    - Kintone の 各アプリの設定画面から アプリの設定 > 設定 > プラグイン の画面で、「[dev用] Associate AIHub for kintone ( AA4k )」を選択して追加する
    - 一覧に追加されるので、設定から設定画面を開き、必要な項目を入力して保存

これでKintone上でJSカスタマイズの動作確認ができる。pluginからは`dist/src/desktop/desktop.js`と`dist/src/config/config.js`を参照しているため、`npm run build`と`npm run build-plugin`を実行すれば、変更を反映できる

以下は、別のプラグインをアップロードする場合の手順

1. プラグインの秘密キーを作成
    kintone pluginのppkファイルがplugin/ppkに作成される ※すでにppkファイルが存在する場合は不要
    ```
    npm run init-dev
    ```
2. アップロード用の環境変数の準備
    `app/scripts/.env.development.sample` をコピーして、`app/scripts/.env.development` を作成
    `app/scripts/.env.development` を自分のkintoneアカウント情報に修正
    ```
    KINTONE_BASE_URL=https://ai-showcase.cybozu.com/
    KINTONE_USERNAME=xxxx
    KINTONE_PASSWORD=xxxx
    ```
3. kintone環境へアップロード
    dist/src/desktop/desktop.jsが作成される
    dist/src/config/config.jsが作成される
    distにplugin-dev.zipが作成される
    .envに設定されているkintone環境へアップロードされる
    ```
    npm run package-dev
    ```

## パッケージング

1. 各種ライブラリをインストール
    node_modulesフォルダが作成される
    ```
    npm i
    ```
2. プラグインの秘密キーを作成
    kintone pluginのppkファイルが作成される ※すでにppkファイルが存在する場合は不要
    ```
    npm run init
    ```
3. Zipファイルの作成
    dist/src/desktop/desktop.jsが作成される
    dist/src/config/config.jsが作成される
    distにplugin.zipが作成される
    ```
    npm run package
    ```

これでプラグイン設定用のZipファイルが作成される。
Kintone の 設定画面から kintoneシステム管理 > プラグイン の画面で「Associate AIHub for kintone ( AA4K )」を選択して追加することで、各アプリでプラグイン追加できる