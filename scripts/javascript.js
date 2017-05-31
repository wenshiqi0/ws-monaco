const request = require('request');
const chalk = require('chalk');
const fsExtra = require('fs-extra');
const { makeCompletion, CompletionItemKind } = require('./utils');

const host = 'https://raw.githubusercontent.com/pichillilorenzo/JavaScript-Completions/master/sublime-completions';

// this is not a good completion as we want.
const newFunction = /^new Function/;
const Func = /^Function/;

const allIndex = {
  Object: 'Object.sublime-settings',
  Function: 'Function.sublime-settings',
  JSON: 'JSON.sublime-settings',
  Global: 'Global.sublime-settings'
}

const makeRequest = (index) => {
  return new Promise((resolve, reject) => {
    request(
      `${host}/${index}`,
      (error, response, body) => {
        if (error) reject(error);
        const { completions } = JSON.parse(body);
        resolve(completions);
      }
    );
  })
}

const handleCompletionsAndDescs = (type, completions, descs) => {
  let global = type === 'Global' ? [] : {};
  let local = {};
  local.methods = {};
  completions.forEach((completion, index) => {
    const func = completion[0];
    const funcArray = func.split('_');
    if (funcArray.length > 1 && funcArray[0].match(/^[a-zA-Z\_]+$/)) {
      const entry = funcArray[0];
      const method = funcArray[1].split('\t')[0];
      const desc = findDescByMethodName(method, descs)[0];
      local.entry = entry;
      local.methods[method] = {
        insertText: {
          value: makeCompletion(completion, entry),
        },
        documentation: desc[1].description,
        kind: CompletionItemKind[desc[1].type],
      };
    } else {
      const method = funcArray[0].split('\t')[0];
      if (!method.match(/^[a-z\_]/)) return;
      const desc = findDescByMethodName(method, descs)[0];
      if (type === 'Global') {
        global.push({
          label: method,
          insertText: {
            value: makeCompletion(completion),
          },
          documentation: desc[1].description,
          kind: CompletionItemKind[desc[1].type],
        })
      } else {
        global[method] = {
          insertText: {
            value: makeCompletion(completion),
          },
          documentation: desc[1].description,
          kind: CompletionItemKind[desc[1].type],
        };
      }
    }
  })
  return { global, local };
}

const findDescByMethodName = (method, descs) => {
  return descs.filter(desc => {
    return desc[1].name === method;
  });
}

async function doRequestAll() {
  let realGlobal = {};
  let locals = [];
  let types = Object.keys(allIndex);

  for (let i = 0; i < types.length; i++) {
    const index = allIndex[i];
    console.log(chalk.green(`${types[i]} start`));
    const completions = await makeRequest(allIndex[types[i]]);
    const descriptions = await makeRequest(`description-${allIndex[types[i]]}`);
    const { global, local } = handleCompletionsAndDescs(types[i], completions, descriptions);
    if (local.entry && local.entry.match(/^[a-zA-Z]+$/)) {
      fsExtra.writeJsonSync(`./plugins/api/javascript/${local.entry}.json`, local);
    }
    if (types[i] === 'Global') {
      fsExtra.writeJsonSync(`./plugins/api/javascript/env.json`, global);
    } else {
      realGlobal = Object.assign({}, global, realGlobal);
    }
    console.log(chalk.green(`${types[i]} completed`));
  }

  fsExtra.writeJsonSync(`./plugins/api/javascript/global.json`, realGlobal);
}

doRequestAll();