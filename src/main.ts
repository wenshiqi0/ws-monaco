import { ipcMain as ipc } from 'electron';

import '../plugins/syntaxes/javascript/src/main';
import { NewEsLintCLIEngine } from '../plugins/syntaxes/eslint/src/main';
import '../plugins/syntaxes/css/src/main';

global.NewEsLintCLIEngine = NewEsLintCLIEngine;
global.Ant = {};
const Ant = global.Ant;

Ant.modelsMap = new Map();

Ant.Model = class {
  constructor(options) {
    const { uri, value, version } = options;
    this.uri = uri;
    this.value = value;
    this.version = version;
  }

  update({ uri, value, version }) {
    if (uri === this.uri) {
      this.value = value;
      this.version = version;
    } else {
      throw new Error('Can not update the value to a model which is not belong to it.')
    }
  }

  getVersion() {
    return this.version;
  }

  getValue() {
    return this.value;
  }
}

ipc.on('ant-monaco:createOrUpdateModel', (e, args) => {
  const model = args;
  if (Ant.modelsMap.has(model.uri)) {
    Ant.modelsMap.get(model.uri).update(model);
  } else {
    Ant.modelsMap.set(model.uri, new Ant.Model(model));
  }
})