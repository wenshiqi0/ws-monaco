const { readFile } = require('fs');
const join = require('path').join;
const container = document.getElementById('editor')

const { GrammarRegistry, getDefaultRegistry, editorOptions, setLintRc } = require('../lib');

let editor;
const language = 'json';

// 新的 vscode textmate 语法解析实现
const registry = getDefaultRegistry(join(__dirname, '../lib'));
setLintRc(join(__dirname, './lint.json'));
const body = document.body;

// theme 注册为黑色的 token
GrammarRegistry.setMode('dark');

// 初始内容
const initText = `
{
  "pages": [
    "page/component/index",
    "page/component/component-pages/action-sheet/action-sheet",
    "page/component/component-pages/audio/audio",
    "page/component/component-pages/button/button",
    "page/component/component-pages/canvas/canvas",
    "page/component/component-pages/checkbox/checkbox",
    "page/component/component-pages/form/form",
    "page/component/component-pages/icon/icon",
    "page/component/component-pages/image/image",
    "page/component/component-pages/input/input",
    "page/component/component-pages/label/label",
    "page/component/component-pages/loading/loading",
    "page/component/component-pages/map/map",
    "page/component/component-pages/modal/modal",
    "page/component/component-pages/navigator/navigate",
    "page/component/component-pages/navigator/redirect",
    "page/component/component-pages/navigator/navigator",
    "page/component/component-pages/picker/picker",
    "page/component/component-pages/picker-view/picker-view",
    "page/component/component-pages/progress/progress",
    "page/component/component-pages/radio/radio",
    "page/component/component-pages/scroll-view/scroll-view",
    "page/component/component-pages/slide-tab/slide-tab",
    "page/component/component-pages/slider/slider",
    "page/component/component-pages/swiper/swiper",
    "page/component/component-pages/switch/switch",
    "page/component/component-pages/text/text",
    "page/component/component-pages/textarea/textarea",
    "page/component/component-pages/toast/toast",
    "page/component/component-pages/video/video",
    "page/component/component-pages/view/view",

    "page/API/index/index",
    "page/API/share/share",
    "page/API/action-sheet/action-sheet",
    "page/API/alert/alert",
    "page/API/animation/animation",
    "page/API/canvas/canvas",
    "page/API/choose-city/choose-city",
    "page/API/confirm/confirm",
    "page/API/contact/contact",
    "page/API/date-picker/date-picker",
    "page/API/download-file/download-file",
    "page/API/file/file",
    "page/API/get-auth-code/get-auth-code",
    "page/API/get-location/get-location",
    "page/API/get-network-type/get-network-type",
    "page/API/get-system-info/get-system-info",
    "page/API/get-user-info/get-user-info",
    "page/API/image/image",
    "page/API/loading/loading",
    "page/API/make-phone-call/make-phone-call",
    "page/API/navigation-bar-loading/navigation-bar-loading",
    "page/API/navigator/navigator",
    "page/API/on-accelerometer-change/on-accelerometer-change",
    "page/API/on-compass-change/on-compass-change",
    "page/API/open-location/open-location",
    "page/API/pull-down-refresh/pull-down-refresh",
    "page/API/request/request",
    "page/API/request-payment/request-payment",
    "page/API/scan-code/scan-code",
    "page/API/set-navigation-bar/set-navigation-bar",
    "page/API/storage/storage",
    "page/API/toast/toast",
    "page/API/upload-file/upload-file",
    "page/API/vibrate/vibrate",
    "page/API/video/video",
    "page/API/watch-shake/watch-shake",
    "page/API/clipboard/clipboard",
    "page/API/rsa/rsa"
  ],
  "window": {
    "enableWK":true,
    "defaultTitle": "小程序",
    "backgroundColor": "#fff",
    "pullRefresh": false,
    "allowsBounceVertical": true
  },
  "tabBar": {
    "textColor": "#404040",
    "selectedColor": "#108ee9",
    "backgroundColor": "#ffffff",
    "items": [{
      "pagePath": "page/component/index",
      "icon": "image/icon_component.png",
      "activeIcon": "image/icon_component_HL.png",
      "name": "组件"
    }, {
      "pagePath": "page/API/index/index",
      "icon": "image/icon_API.png",
      "activeIcon": "image/icon_API_HL.png",
      "name": "API"
    }]
  },
  "debug": true
}
`;

const jsText = `
let editor;
const language = 'json';

// 新的 vscode textmate 语法解析实现
const registry = getDefaultRegistry(join(__dirname, '../lib'));
setLintRc(join(__dirname, './lint.json'));
const body = document.body;
`

// monaco 使用的 amd 方式来加载 monaco
const loader = require('ant-monaco-editor/dev/vs/loader');

// 指定 monaco 文件的地址目录，这里需要使用绝对路径
loader.require.config({
  baseUrl: join(__dirname, '../node_modules/ant-monaco-editor/dev'),
})

// 开始加载 monaco
loader.require(['./vs/editor/editor.main'], async function () {
  const globalEditor = window.monaco.editor;

  // 定义编辑器的外观皮肤，目前实现有 dark 和 light
  globalEditor.defineTheme('tiny', {
    base: 'vs-dark',
    inherit: true,
    rules: [], // 之后实际要复写这些rules的，所以干脆就传个空数组进去
    colors: GrammarRegistry.getDefaultColors(),
  });

  // 注册编辑器的皮肤
  globalEditor.setTheme('tiny');

  // monaco 编辑器的 dom 容器
  const container = document.createElement('div');
  container.setAttribute('style', `height: ${window.innerHeight}px; width: ${window.innerWidth}px;`);

  // resize 事件注册
  window.onresize = () => {
    container.setAttribute('style', `height: ${window.innerHeight}px; width: ${window.innerWidth}px;`);
    editor.layout();
  }

  body.appendChild(container);
  handleDragFile(container);

  // 创建第一个编辑器实例
  editor = window.monaco.editor.create(container, Object.assign({}, editorOptions, {
    tabSize: 2,
  }));

  // 设置编辑器为当前上下文
  registry.setCurrentEditor(editor);
  // 启动语法插件
  registry.activateExtensions();

  // monaco 根据 token rules 解析出来的 css rules 和 vscode-textmate 有差异
  // 所以这个地方直接复写掉这一部分的 css 样式，用 vscode-textmate 的解析结果来代替
  registry.reloadTheme('tiny');

  // 异步注册语言，并创建 textModel，将当前 model 装载进 editor 中
  await Promise.resolve({ languageId: language, registry })
    .then((res) => { if (language) return GrammarRegistry.loadGrammar(res); })
    .then((res) => { if (language) return GrammarRegistry.registerLanguage(res); })
    .then(() => {
        const model = window.monaco.editor.createModel(initText, language, 'ant-monaco://test');
        editor.setModel(model);
    })
});

function handleDragFile(dom) {
  // 文件拖拽
  dom.ondragover = (e) => false
  dom.ondragleave = (e) => false
  dom.ondragend = (e) => false
  dom.ondrop = (e) => {
    e.preventDefault()

    const file = e.dataTransfer.files[0];

    readFile(file.path, 'utf8', (err, text) => {
      const models = window.monaco.editor.getModels();
      if (models[0])
        models[0].setValue(text);
    });
    
    return false;
  }
}