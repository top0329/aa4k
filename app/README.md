# AA4k Plugin App

## 環境構築

### パッケージインストール
- `npm i`

### 開発環境サーバー起動
- `npm run dev`


## 開発環境構築
### kintone環境への反映(初回のみ)

※対象のkintone環境へすでにdev用プラグインが設定されている場合は不要

1. 各種ライブラリをインストール
    ```
    npm i
    ```
    - node_modulesフォルダが作成される

2. アップロード用の環境変数の準備
    `app/scripts/.env.development.sample` をコピーして、`app/scripts/.env.development` を作成
    `app/scripts/.env.development` を自分のkintoneアカウント情報に修正
    ```
    KINTONE_BASE_URL=https://ai-showcase.cybozu.com/
    KINTONE_USERNAME=xxxx
    KINTONE_PASSWORD=xxxx
    ```

3. kintone環境へアップロード
    ```
    npm run package-dev
    ```
    - dist/src/desktop/desktop.jsが作成される
    - dist/src/config/config.jsが作成される
    - distにplugin-dev.zipが作成される
    - `app/scripts/.env.development`に設定されているkintone環境へアップロードされる

4. 各アプリでプラグインを導入
    - Kintone の 各アプリの設定画面から アプリの設定 > 設定 > プラグイン の画面で、「[dev用] Associate AI Hub for kintone」を選択して追加する
    - 一覧に追加されるので、設定から設定画面を開き、必要な項目を入力して保存

これでKintone上にdev用のプラグインがインストールされる。
pluginからは`dist/src/desktop/desktop.js`と`dist/src/config/config.js`を参照しているため、`npm run build`と`npm run build-plugin`を実行すれば、変更を反映できる
（下記の[ローカル環境のビルド・起動](#ローカル環境のビルド・起動)を参照）

### ローカル環境のビルド・起動
1. 各種ライブラリをインストール
    ```
    npm i
    ```
    - node_modulesフォルダが作成される

2. desktop.jsのビルド
    アップロード後にdesktop.jsを変更する場合
    ```
    npm run build
    ```
    - dist/src/desktop/desktop.jsが作成される

3. config.jsのビルド
    アップロード後にconfig.jsを変更する場合
    ```
    npm run build-plugin
    ```
    - dist/src/config/config.jsが作成される

4. ローカルサーバーの起動
    https://localhost:4173/ でローカルサーバーが立ち上がる
    ```
    npm run preview
    ```

## デモ環境構築
1. 各種ライブラリをインストール
    ```
    npm i
    ```
    - node_modulesフォルダが作成される

2. Zipファイルの作成
    ```
    npm run package-stg
    ```
    - distにplugin-stg.zipが作成される

3. 各アプリでプラグインを導入
    - Kintone の 各アプリの設定画面から アプリの設定 > 設定 > プラグイン の画面で、「[デモ用] Associate AI Hub for kintone」を選択して追加する
    - 一覧に追加されるので、設定から設定画面を開き、必要な項目を入力して保存


## 本番用パッケージング
1. 各種ライブラリをインストール
    ```
    npm i
    ```
    - node_modulesフォルダが作成される

2. 本番用ppkファイルの配置
    `app\plugin\ppk\private.ppk`を配置する
    1. 初回リリース時
        ```
        npm run init
        ```
        - `app\plugin\ppk\private.ppk`が作成される
        - 次回以降のリリース時にも必要のため大切に保存しておく TODO: 保存方法は未定
    2. 2回目以降のリリース時
        - 初回に保存しておいたppkファイルを配置
    
2. Zipファイルの作成
    ```
    npm run package
    ```
    - distにplugin.zipが作成される

