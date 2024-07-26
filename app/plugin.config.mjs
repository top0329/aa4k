//@ts-check
import { config } from 'dotenv';
config();

const localhost = 'https://localhost:4173';
const NPM_PACKAGE_VERSION = process.env.npm_package_version;

export default {
  manifest: {
    base: {
      manifest_version: 1,
      version: NPM_PACKAGE_VERSION,
      type: 'APP',
      name: { en: '', ja: '', zh: '' },
      description: {
        en: 'AI will generate custom JavaScript when you want to display or behave in a way that is not available in the basic functionality of kintone.',
        ja: 'kintoneの基本機能にない表示や動作をさせたいときに、AIがカスタムJavaScriptの生成を行います。',
        zh: '如果您需要的显示或行为不包括在 kintone 的基本功能中，人工智能会生成自定义 JavaScript。',
      },
      icon: 'icon.png',
      desktop: { js: [], css: [] },
      mobile: { js: [], css: [] },
      config: {
        html: 'config.html',
        js: [],
        css: [],
        required_params: ["subscriptionId"],
      },
    },
    dev: {
      name: {
        en: '[開発用] Associate AI Hub for kintone',
        ja: '[開発用] Associate AI Hub for kintone',
        zh: '[開発用] Associate AI Hub for kintone',
      },
      desktop: {
        js: [`${localhost}/src/desktop/desktop.js`],
        css: [],
      },
      mobile: { js: [], css: [], },
      config: {
        js: [`${localhost}/src/config/config.js`],
        css: [
          `config.css`,
          `51-modern-default.css`,
        ]
      },
    },
    stg: {
      name: {
        en: '[デモ用] Associate AI Hub for kintone',
        ja: '[デモ用] Associate AI Hub for kintone',
        zh: '[デモ用] Associate AI Hub for kintone',
      },
      desktop: {
        js: ['desktop.js'],
        css: []
      },
      mobile: { js: [], css: [], },
      config: {
        js: ['config.js'],
        css: [
          'config.css',
          '51-modern-default.css',
        ]
      },
    },
    prod: {
      name: {
        en: 'Associate AI Hub for kintone',
        ja: 'Associate AI Hub for kintone',
        zh: 'Associate AI Hub for kintone',
      },
      desktop: {
        js: ['desktop.js'],
        css: []
      },
      mobile: { js: [], css: [], },
      config: {
        js: ['config.js'],
        css: [
          'config.css',
          '51-modern-default.css',
        ]
      },
    },
  },
};
