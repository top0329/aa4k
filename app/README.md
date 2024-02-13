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

2. ビルド
    dist/devにdesktop.jsが作成される
    ```
    npm run build
    ```

3. ローカルサーバーの起動
    https://localhost:4173/ でローカルサーバーが立ち上がる
    ```
    npm run preview
    ```

4. プラグインの秘密キーを作成
    kintone pluginのppkファイルが作成される
    ```
    npm run init-dev
    ```
  
5. kintone環境へアップロード
    distにplugin-dev.zipが作成され、.envに設定されているkintone環境へアップロードされる
    ```
    npm run package-dev
    ```

6. 各アプリでプラグインを導入
    - Kintone の 各アプリの設定画面から アプリの設定 > 設定 > プラグイン の画面で、「Associate AIHub for kintone ( AA4K )」を選択して追加する
    - 一覧に追加されるので、設定から設定画面を開き、必要な項目を入力して保存

これでKintone上でJSカスタマイズの動作確認ができる。pluginからはdist/dev/desktop.jsを参照しているため、`npm run build`を実行すれば、変更を反映できる


## パッケージング

1. 各種ライブラリをインストール
    node_modulesフォルダが作成される
    ```
    npm i
    ```
2. ビルド
    dist/devにdesktop.jsが作成される
    ```
    npm run build
    ```
4. プラグインの秘密キーを作成
    kintone pluginのppkファイルが作成される
    ```
    npm run init
    ```
4. Zipファイルの作成
    distにplugin.zipが作成される
    ```
    npm run package
    ```

これでプラグイン設定用のZipファイルが作成される。
Kintone の 設定画面から kintoneシステム管理 > プラグイン の画面で「Associate AIHub for kintone ( AA4K )」を選択して追加することで、各アプリでプラグイン追加できる