import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  resolve: {
    alias: {
      "~/": `${__dirname}/src/`, // path.join(__dirname, "src/") でも可
    },
  },
  build: {
    target: "ES2022",
    rollupOptions: {
      input: {
        config: "src/plugin/config.ts"
      },
      output: {
        format: "iife", // 即時関数で囲む
        dir: "dist/src/config", // 「dist」ディレクトリーの下にビルド後のファイルを生成する
        entryFileNames: "[name].js", // 生成物のファイル名は input のキー名とする
      },
    },
    assetsInlineLimit: 1048576, // MP3のSEもJSに含めるために 1 MiB で上限設定.
  },
  preview: {
    port: 4173,
    strictPort: true,
    // typescriptエラーで起動しないので一旦コメントアウト
    // https: true,
  },
  plugins: [mkcert(), svgr(), vanillaExtractPlugin()],
  define: {
    '__NPM_PACKAGE_VERSION__': JSON.stringify(process.env.npm_package_version),
  },
});
