const { readFile } = require('fs');
const { join, dirname, resolve } = require('path');
const container = document.getElementById('editor')

const { start, openProject, editorOptions, GrammarRegistry, updateConfiguration } = require('../lib/editor');

let editor;
const language = 'javascript';

// 新的 vscode textmate 语法解析实现
// const registry = getDefaultRegistry(join(__dirname, '../lib'));
const body = document.body;

// theme 注册为黑色的 token
GrammarRegistry.setMode('dark');

// 初始内容
const initText = `
// 获取应用实例
const app = getApp();

Page({
  data: {
    motto: 'Hello World 4',
    userInfo: {},
  },
  // 事件处理函数
  bindViewTap() {
    abridge.navigateTo({
      url: '../logs/logs',
          })


  },
  onLoad() {
    console.log('onLoad');
    // 调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      console.warn(\`==== \${JSON.stringify(userInfo)}\`);
      // 更新数据
      this.setData({
        userInfo,
      });
    });
  },
});
`;

const cssText = `
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

.monaco-list {
 height: 100%;
 width: 100%;
 white-space: nowrap;
 -webkit-user-select: none;
 -khtml-user-select: none;
 -moz-user-select: -moz-none;
 -ms-user-select: none;
 -o-user-select: none;
 user-select: none;
}

.monaco-list > .monaco-scrollable-element {
 height: 100%;
}

.monaco-list-rows {
 position: relative;
 width: 100%;
 height: 100%;
}

.monaco-list-row {
 position: absolute;
 -moz-box-sizing:	border-box;
 -o-box-sizing:		border-box;
 -ms-box-sizing:		border-box;
 box-sizing:			border-box;
 cursor: pointer;
 overflow: hidden;
 width: 100%;
 touch-action: none;
}

/* for OS X ballistic scrolling */
.monaco-list-row.scrolling {
 display: none !important;
}

/* Focus */
.monaco-list.element-focused { outline: 0 !important; }
`

const schemaText = `
Object(配置) {
	html(HTML/VM代码):Text,
	data(JSON数据):Text
}
`

const textMap = {
  schema: schemaText,
  javascript: initText,
  css: cssText,
}

// monaco 使用的 amd 方式来加载 monaco
const loader = require('ant-monaco-editor/dev/vs/loader');

// 指定 monaco 文件的地址目录，这里需要使用绝对路径
loader.require.config({
  baseUrl: join(__dirname, '../node_modules/ant-monaco-editor/dev'),
  // baseUrl: '/Users/munong/Documents/github/vscode/out-editor',
  'vs/nls' : {  // eslint-disable-line
    availableLanguages: {
      '*': 'zh-cn',
    },
  }, 
})

// 开始加载 monaco`
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

  // 开启 eslint，关闭默认 lint
  updateConfiguration('lintDisable', 'javascript')  

  // 设置编辑器为当前上下文
  // registry.setCurrentEditor(editor);
  // 启动语法插件
  start();
  const testPath = resolve('./example/test');  
  openProject(testPath);

  // monaco 根据 token rules 解析出来的 css rules 和 vscode-textmate 有差异
  // 所以这个地方直接复写掉这一部分的 css 样式，用 vscode-textmate 的解析结果来代替
  // registry.reloadTheme('tiny');
  

  // 异步注册语言，并创建 textModel，将当前 model 装载进 editor 中
  await Promise.resolve({ languageId: language })
    // .then((res) => { if (language) return GrammarRegistry.loadGrammar(res); })
    // .then((res) => { if (language) return GrammarRegistry.registerLanguage(res); })
    .then(() => {
      return window.monaco.editor.createModel(textMap[language], language, join(testPath, `/test.${language === 'javascript' ? 'js' : language}`));
    })
    .then((model) => editor.setModel(model))
});

function handleDragFile(dom) {
  // 文件拖拽
  dom.ondragover = (e) => false
  dom.ondragleave = (e) => false
  dom.ondragend = (e) => false
  dom.ondrop = (e) => {
    e.preventDefault()

    const file = e.dataTransfer.files[0];
    const splited = (file.path || '').split(/\./g);
    const extension = splited[splited.length - 1];

    const extMap = {
      js: 'javascript',
      css: 'css',
      schema: 'schema',
      axml: 'html',
      json: 'json',
      jsx: 'javascriptreact'
    }

    readFile(file.path, 'utf8', async (err, text) => {
      await Promise.resolve({ languageId: extMap[extension] || extension })
        // .then((res) => { if (language) return GrammarRegistry.loadGrammar(res); })
        // .then((res) => { if (language) return GrammarRegistry.registerLanguage(res); })
        .then(() => {
          openProject(dirname(file.path));
          return window.monaco.editor.createModel(text, extMap[extension] || extension, file.path);
        })
        .then((model) => editor.setModel(model))
    });
    
    return false;
  }
}