//@ts-check
import { exec } from 'child_process';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// 使用するenvファイルを指定 (同じディレクトリ内の.env.developmentを使用)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, '.env.development');
config({ path: ENV_PATH });

const {
  KINTONE_BASE_URL,
  KINTONE_USERNAME,
  KINTONE_PASSWORD,
  KINTONE_BASIC_AUTH_USERNAME = '',
  KINTONE_BASIC_AUTH_PASSWORD = '',
} = process.env;
if (!KINTONE_BASE_URL || !KINTONE_USERNAME || !KINTONE_PASSWORD) {
  throw `.envの設定が不十分です。以下のパラメータは必須です
    KINTONE_BASE_URL
    KINTONE_USERNAME
    KINTONE_PASSWORD
    `;
}

let command = `npx kintone-plugin-uploader dist/plugin-dev.zip --base-url ${KINTONE_BASE_URL} --username ${KINTONE_USERNAME} --password ${KINTONE_PASSWORD}`;
if (KINTONE_BASIC_AUTH_USERNAME && KINTONE_BASIC_AUTH_PASSWORD) {
  command += ` --basic-auth-username ${KINTONE_BASIC_AUTH_USERNAME} --basic-auth-password ${KINTONE_BASIC_AUTH_PASSWORD}`;
}

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
  console.log('🐢 プラグインをアップロードしました');
});
