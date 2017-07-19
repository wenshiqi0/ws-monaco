const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');
const markdown = require('mark-twain');

const SITE_FOLDER = process.argv[2];

const dest = [
  'api',
];

const dest2 = [
  'component',
];

function covertBasicType(type, value) {
  if (type === 'Boolean') return '';
  return value;
}

// 文档规范配置，在这里定义一些规范来帮助生成api自动生成文件.
const paramsReg = /^入参/;
const bridgeReg = /^abridge/;
const componentAPIReg = /^API/;
const componentAPIWithModeReg = /^API\((.*)*\)/;
const componentNameReg = /^[a-z\-]*/;
const componentGroupReg = /-group$/;

const apis = [];
const components = [];
// this is for devtools.
const componentsMap = {};
const apisObejct = {};

if (!SITE_FOLDER) {
  console.error('[tiny-apiCreator] Set the key siteFolder into npm config');
  console.error('[tiny-apiCreator] Should know the site file path first');
  process.exit(1);
}

// Api class to define a api with a toString function
class Api {
  constructor(category, name, desc) {
    this.name = name;
    this.desc = desc;
    this.category = category;
    this.params = [];
    this.callback = false;
  }

  /*
    Param Obejct {
      name,
      type,
      required,
      desc,
    }
  */
  setParams(param) {
    if (param) {
      this.params.push(param);
    } else {
      this.params = null;
    }
  }

  setCallback(callback) {
    this.callback = callback;
  }

  toString() {
    if (!this.params && !this.callback) {
      return `${this.name.split('.')[1]}();`;
    }
    let params = '';
    (this.params || []).forEach((param, i) => {
      if (param.required) {
        params += `${i === 0 ? '' : '\n  '}${param.name}: \'${i === 0 ? '$0' : ''}\', // ${param.desc}`;
      }
    });

    if (!params) {
      return `${this.name.split('.')[1]}({
  ${this.callback ? 'success: (res) => {\n    $0\n  },' : ''}
});`;
    }

    if (!this.callback) {
      return `${this.name.split('.')[1]}({
  ${params}
});`;
    }

    return `${this.name.split('.')[1]}({
  ${params}
  ${this.callback ? 'success: (res) => {\n    \n  },' : ''}
});`;
  }
}

class Component {
  constructor(close, tag, reqAttr) {
    this.close = close;
    this.tag = tag.replace(' ', '-');
    this.reqAttr = reqAttr;
    this.attributions = [];
    this.mode = null;
  }

  setAttributions(attribution) {
    this.attributions.push(attribution);
  }

  setDesc(desc) {
    this.desc = desc;
  }

  setMode(mode) {
    this.mode = mode;
  }

  toString() {
    let defaultValue;
    let valueType;
    if (this.reqAttr) {
      this.attributions.forEach((attribute) => {
        if (attribute.label === this.reqAttr) {
          defaultValue = attribute.default;
          valueType = attribute.type;
        }
      });
    }

    // 针对拥有group的组件的特殊处理
    // 目前看这种组件的string都是一致的
    if (this.tag.match(componentGroupReg)) {
      return `<${this.tag}>$0</${this.tag}>`;
    }

    if (this.close && this.reqAttr) {
      return `<${this.tag}${this.mode ? ` mode="${this.mode}"` : ' '}${this.reqAttr}="$1" />`;
    } else if (!this.close && this.reqAttr) {
      return `<${this.tag}${this.mode ? ` mode="${this.mode}"` : ' '}${this.reqAttr}="$1"></${this.tag}>`;
    } else if (this.close && !this.reqAttr) {
      return `<${this.tag}${this.mode ? ` mode="${this.mode}"` : ' '}/>`;
    } else if (!this.close && !this.reqAttr) {
      return `<${this.tag}${this.mode ? ` mode="${this.mode}"` : ''}>$1</${this.tag}>`;
    }
  }

  fit() {
    return {
      documentation: this.desc,
      label: this.mode ? `${this.tag} mode:${this.mode}` : this.tag,
      insertText: { value: this.toString() },
      attributes: this.attributions,
    };
  }
}

dest.forEach((api) => {
  fsExtra.readdirSync(path.join(SITE_FOLDER, api)).forEach((folder, i) => {
    const fullpath = path.join(SITE_FOLDER, api, folder);
    const content = fs.readFileSync(fullpath, 'utf-8');
    const jsonML = markdown(content);
    const realContent = jsonML.content;

    for (let j = 0; j < realContent.length; ++j) {
      const ml = realContent[j];
      if (ml[0] === 'h2' && ml[1].match(bridgeReg)) {
        j += 1;
        const newApi = new Api(api, ml[1], realContent[j][1]);
        if (!realContent[j + 1] || !realContent[j + 1][1] || !realContent[j + 1][1].match || !realContent[j + 1][1].match(paramsReg)) {
          newApi.setParams(null);
        } else {
          while (++j) if (realContent[j][0] === 'table') break;
          const params = realContent[j][2];
          params.forEach((item) => {
            if (!item[1][1]) return;
            if (['success', 'fail', 'complete'].indexOf(item[1][1]) > -1) {
              newApi.setCallback(true);
              return;
            }
            newApi.setParams({
              name: item[1][1],
              type: item[2][1],
              required: (!item[3][1].match(/^是/)) === false,
              desc: (item[4] && item[4][1]) || '',
            });
          });
        }
        apis.push(newApi);
      }
    }
  });
});

dest2.forEach((component) => {
  fsExtra.readdirSync(path.join(SITE_FOLDER, component)).forEach((folder, i) => {
    let newComponent;
    const fullpath = path.join(SITE_FOLDER, component, folder);
    const content = fs.readFileSync(fullpath, 'utf-8');
    const jsonML = markdown(content);
    const realContent = jsonML.content;
    const meta = jsonML.meta;

    if (meta.notPublish) {
      return;
    }

    for (let j = 0; j < realContent.length; ++j) {
      if (realContent[j][0] === 'h2' && realContent[j][1].match(componentNameReg)) {
        newComponent = new Component(meta.close, realContent[j][1], meta.require);
        j += 1;
        newComponent.setDesc(realContent[j][1]);
      }
      if (realContent[j][0] === 'h3' && realContent[j][1].match(componentAPIReg)) {
        const retArray = componentAPIWithModeReg.exec(realContent[j][1]);
        if (retArray) {
          newComponent = new Component(meta.close, meta.title.replace(' ', '-').toLowerCase(), meta.require);
          newComponent.setDesc(retArray[1]);
          newComponent.setMode(retArray[1].split('=')[1].replace(/^\s*/, '').replace(/\s*$/, ''));
        }
        j += 1;

        realContent[j][2].forEach((item, k) => {
          if (k === 0) return;
          if (!newComponent) {
            newComponent = new Component(meta.close, meta.title.replace(' ', '-').toLowerCase(), meta.require);
            newComponent.setDesc(realContent[1][1]);
          }
          newComponent.setAttributions({
            label: item[1][1],
            type: item[2][1],
            default: (item[3] && item[3][1]) || '',
            insertText: { value: `${item[1][1]}="$0"` },
            documentation: (item[5] && item[5][1]) || (item[4] && item[4][1]) || null,
          });
        });
        components.push(newComponent.fit());
        componentsMap[newComponent.tag] = newComponent;
        newComponent = null;
      }
    }
  });
});

// console.log(JSON.stringify(apis));

apis.map((api) => {
  apisObejct[api.name.split('.')[1]] = {
    insertText: { value: api.toString() },
    documentation: api.desc,
  };
});

function handleUpperAndLower(type) {
  const lowerType = type.trim().toLowerCase();
  switch (lowerType) {
    case 'object':
      return 'Object';
    case 'array':
      return 'Array<string>';
    case 'arraybuffer':
      return 'ArrayBuffer';
    default:
      return lowerType;
  }
}

function handleDoubleType(types) {
  const splited = types.split(/[(\s|\/),]+/);
  if (splited.length > 1) {
    const first = handleUpperAndLower(splited[0]);
    const second = handleUpperAndLower(splited[1]);
    return `${first} | ${second}`;
  } else {
    return handleUpperAndLower(types);
  }
}

function normalise(number) {
  let spaces = '';
  for (let i = 0; i < number; i++) {
    spaces += ' ';
  }
  return spaces;
}

function makeApiDesc(name, params, callback) {
  return `  /**
   * ${apisObejct[name].documentation}
   *
   * ${(params && params.length > 0) ? `@param apiParams abridge api ${name} params object` : ''}
${(params && params.length > 0) ? '--------------------------\n参数                   描述' : ''}
${(params || []).map((param) => {
  return `${param.name + normalise(20 - param.name.length)}${param.desc}`;
}).join('\n')}
   */`
}

function makeParams (name, params, callback) {
  const paramsDetils = (params || []).map(param => ` /** \n  * ${param.desc}\n  */\n ${param.name}${callback ? '?' : ''}: ${(handleDoubleType(param.type) || '').replace('/', ' | ')};\n`);

  if (paramsDetils.length === 0) return '';

  if (callback) {
    paramsDetils.push('  /** \n   * 接口调用成功的回调函数\n   * @param res 成功返回参数 \n   */\n  success? (res: Object): void;\n');
    paramsDetils.push('  /** \n   * 接口调用失败的回调函数\n   * @param error 失败返回错误码 \n   */\n  fail? (error: number): void;\n');
    paramsDetils.push('  /** \n   * 接口调用结束的回调函数（调用成功、失败都会执行）\n   */\n  complete? (): void;\n');
  }

  return `interface ${name}Params {
${paramsDetils.join('\n')}
}
`;
}

function makeFunctionDefine (name, params, callback) {
  if (name.indexOf('(') > -1) {
    return `  ${name}: void;`;
  } else if (!params || params.length === 0) {
    return `  ${name}(): void;`;
  } else {
    return `  ${name}(apiParams: ${name}Params): void;`;
  }
}

// api 处理流程

const defineString = `
${apis.map(api => {
  return makeParams(api.name.split('.')[1], api.params, api.callback);
}).join('')}

interface Abridge {
${apis.map(api => {
  return `
${makeApiDesc(api.name.split('.')[1], api.params, api.callback)}
${makeFunctionDefine(api.name.split('.')[1], api.params, api.callback)}
  `
}).join('')}
}

declare var Abridge: {
    prototype: Abridge;
    new(): Abridge;
};

declare var abridge: Abridge;
`;

// 清理文件夹
fsExtra.removeSync('./plugins/api');

// 创建文件
fs.mkdirSync('./plugins/api');
fs.mkdirSync('./plugins/api/javascript/');
fs.mkdirSync('./plugins/api/html/');

// 写入到文件
fsExtra.outputJson('./plugins/api/javascript/abridge.json', apisObejct, { spaces: 2 });
fs.writeFileSync('./plugins/api/javascript/lib.abridge.spec.ts', defineString);
fsExtra.outputJson('./plugins/api/html/axml.json', components, { spaces: 2 });


// 组件处理流程

fs.mkdirSync('./plugins/api/axml/');

fsExtra.outputJson('./plugins/api/axml/components.json', components, { spaces: 2 });
fsExtra.outputJson('./plugins/api/axml/componentsMap.json', componentsMap, { spaces: 2 });