//@ts-check
const localhost = 'https://localhost:4173';

export default {
  manifest: {
    base: {
      manifest_version: 1,
      version: '1.0.0',
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
        required_params: [],
      },
    },
    dev: {
      name: {
        en: '[dev用] Associate AIHub for kintone ( AA4K )',
        ja: '[dev用] Associate AIHub for kintone ( AA4K )',
        zh: '[dev用] Associate AIHub for kintone ( AA4K )',
      },
      desktop: {
        js: [`${localhost}/dev/desktop.js`],
        css: [],
      },
      mobile: { js: [], css: [], },
      config: {
        js: [`${localhost}/dev/config.js`],
        css: [`${localhost}/dev/config.css`]
      },
    },
    prod: {
      name: {
        en: 'Associate AIHub for kintone ( AA4K )',
        ja: 'Associate AIHub for kintone ( AA4K )',
        zh: 'Associate AIHub for kintone ( AA4K )',
      },
      desktop: {
        js: ['desktop.js'],
        css: []
      },
      mobile: { js: [], css: [], },
      config: {
        js: ['config.js'],
        css: ['config.css']
      },
    },
  },
};
