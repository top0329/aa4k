//@ts-check
import fs from 'fs';
import path from 'path';

try {
  const envName = process.argv[2] ?? 'dev';
  const ppkFileName = envName == 'prod' ? 'private.ppk' : `private-${envName}.ppk`

  const root = process.cwd();
  const distPath = path.join(root, 'plugin/ppk');

  const files = fs.readdirSync('dist');

  const target = files.filter((file) => file.indexOf('.ppk') !== -1);

  const ppkFiles = fs.existsSync(distPath) ? fs.readdirSync(`plugin/ppk/`) : [];
  const exists = ppkFiles.filter((file) => file.indexOf(ppkFileName) !== -1);
  if (exists.length) {
    throw `${ppkFileName}がすでに存在します。`;
  }
  if (!target.length) {
    throw "ppkファイルの作成に失敗した可能性があります。"
  }
  const ppkPath = path.join(root, 'dist', target[0]);

  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  fs.renameSync(ppkPath, path.join(distPath, ppkFileName));

  console.log('ppkファイルの作成が完了しました。プラグインをアップロードできます🍀');
} catch (error) {
  console.error(
    'ppkファイルの移動に失敗しました。',
    error
  );
}
