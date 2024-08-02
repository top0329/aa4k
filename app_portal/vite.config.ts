import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import replace from "rollup-plugin-replace";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const fileName = isProd ? 'aa4k_portal' : 'aa4k_portal_demo';
  return {
    resolve: {
      alias: {
        "~/": `${__dirname}/src/`, // path.join(__dirname, "src/") でも可
      },
    },
    build: {
      target: "ES2022",
      rollupOptions: {
        input: {
          desktop: "src/main.tsx",
        },
        output: {
          format: "iife", // 即時関数で囲む
          dir: "dist", // 「dist」ディレクトリーの下にビルド後のファイルを生成する
          entryFileNames: `${fileName}.js`, // 生成物のファイル名は input のキー名とする
        },
      },
      assetsInlineLimit: 1048576, // MP3のSEもJSに含めるために 1 MiB で上限設定.
    },
    preview: {
      port: 4174,
      strictPort: true,
      // typescriptエラーで起動しないので一旦コメントアウト
      // https: true,
    },
    plugins: [
      mkcert(),
      svgr(),
      vanillaExtractPlugin({ identifiers: 'debug' }),
      replace({
        "use client": "",
        delimiters: ["", ""],
      }),
    ],
    define: {
      '__NPM_PACKAGE_VERSION__': JSON.stringify(process.env.npm_package_version),
    },
  }
});
