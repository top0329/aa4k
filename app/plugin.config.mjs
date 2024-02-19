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
        en: 'AI product for Kintone\nProvides features such as JS customization in natural language via LLM',
        ja: 'キントーン向けAIプロダクト\nLLMによる自然言語でのJSカスタマイズ機能などを提供する',
        zh: '为Kintone提供的AI产品，包括通过LLM以自然语言进行JS定制功能等。',
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
        en: '[dev用] Associate AIHub for kintone ( AA4k )',
        ja: '[dev用] Associate AIHub for kintone ( AA4k )',
        zh: '[dev用] Associate AIHub for kintone ( AA4k )',
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
    prod: {
      name: {
        en: 'Associate AIHub for kintone ( AA4k )',
        ja: 'Associate AIHub for kintone ( AA4k )',
        zh: 'Associate AIHub for kintone ( AA4k )',
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
