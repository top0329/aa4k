# 環境構築

## バージョン
nodejs vv20.10.0
npm 10.2.3

## 準備
デプロイするAWSのProfileを設定する

## 手順
1. `npm run cdk bootstrap -- --profile <AWS Profile>`
1. `npm run cdk synth -- -c environment=<環境>`
1. `npx cdk deploy --all -c environment=<環境> --profile <AWS Profile>`
1. Secrets Manager を AWS コンソールから開き、正しいキーを設定する
1. 作成された Nat Gateway の IP をAWS コンソールから調べ、Azure Open AI のIP制限ホワイトリストに加える
1. DB設定
   1. `infra/bin/db/public`配下のSQLファイルを順番に実行
   1. `infra/bin/db/customer`配下のSQLファイルを順番に実行（全顧客別スキーマ分）


### dev環境
1. `npm run cdk synth -- -c environment=dev`
1. `npx cdk deploy --all -c environment=dev --profile <AWS Profile>`
### stg環境
1. `npm run cdk synth -- -c environment=stg`
1. `npx cdk deploy --all -c environment=stg --profile <AWS Profile>`
### 本番環境
1. `npm run cdk synth -- -c environment=prod`
1. `npx cdk deploy --all -c environment=prod --profile <AWS Profile>`
