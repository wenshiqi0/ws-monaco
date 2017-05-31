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
  ${this.callback ? 'success: function(res){\n    $0\n  },' : ''}
});`;
    }

    if (!this.callback) {
      return `${this.name.split('.')[1]}({
  ${params}
});`;
    }

    return `${this.name.split('.')[1]}({
  ${params}
  ${this.callback ? 'success: function(res){\n    \n  },' : ''}
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
      return `<${this.tag}${this.mode ? ` mode="${this.mode}"` : ' '}${this.reqAttr}="{{${covertBasicType(valueType, defaultValue)}}}" />`;
    } else if (!this.close && this.reqAttr) {
      return `<${this.tag}${this.mode ? ` mode="${this.mode}"` : ' '}${this.reqAttr}="{{${covertBasicType(valueType, defaultValue)}}}"></${this.tag}>`;
    } else if (this.close && !this.reqAttr) {
      return `<${this.tag}${this.mode ? ` mode="${this.mode}"` : ' '}/>`;
    } else if (!this.close && !this.reqAttr) {
      return `<${this.tag}${this.mode ? ` mode="${this.mode}"` : ''}>$0</${this.tag}>`;
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
        if (!realContent[j + 1] || !realContent[j + 1][1].match || !realContent[j + 1][1].match(paramsReg)) {
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
          newComponent = new Component(meta.close, meta.english.replace(' ', '-').toLowerCase(), meta.require);
          newComponent.setDesc(retArray[1]);
          newComponent.setMode(retArray[1].split('=')[1].replace(/^\s*/, '').replace(/\s*$/, ''));
        }
        j += 1;
        realContent[j][2].forEach((item, k) => {
          if (k === 0) return;
          if (!newComponent) {
            newComponent = new Component(meta.close, meta.english.replace(' ', '-').toLowerCase(), meta.require);
            newComponent.setDesc(realContent[1][1]);
          }
          newComponent.setAttributions({
            label: item[1][1],
            type: item[2][1],
            default: (item[3] && item[3][1]) || '',
            insertText: { value: `${item[1][1]}="{{${covertBasicType(item[2][1], ((item[3] && item[3][1]) || ''))}}}"` },
            documentation: (item[5] && item[5][1]) || (item[4] && item[4][1]) || null,
          });
        });
        components.push(newComponent.fit());
        newComponent = null;
      }
    }
  });
});

apis.map((api) => {
  apisObejct[api.name.split('.')[1]] = {
    insertText: { value: api.toString() },
    documentation: api.desc,
  };
});

// 清理文件夹
fsExtra.removeSync('./plugins/api');

// 创建文件
fs.mkdirSync('./plugins/api');
fs.mkdirSync('./plugins/api/javascript/');
fs.mkdirSync('./plugins/api/html/');

// 写入到文件
fs.writeFileSync('./plugins/api/javascript/abridge.json', JSON.stringify(apisObejct));
fs.writeFileSync('./plugins/api/html/axml.json', JSON.stringify(components));
