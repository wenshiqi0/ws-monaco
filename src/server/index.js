import * as cp from 'child_process';
import MirrorModel from './mirrorModel';
import Event from './event';

import '../../plugins/syntaxes/eslint/src/server';
// import '../../plugins/syntaxes/javascript/src/server';

const modelsMap = new Map();

const messageHandler = {
  onInitDocument(params) {
    const { uri, lines, eol, language, versionId } = params;
    const mirror = new MirrorModel(uri, lines, eol, language, versionId);
    modelsMap.set(uri, mirror);

    // init model event
    Event.dispatchGlobalEvent(MirrorModel.Events.onInitDocument, { language, model: mirror });
  },
  onDidChangeFlushed(params) {
    const { uri, events } = params;
    const model = modelsMap.get(uri);
    model.onEvents(events);

    // update model event
    Event.dispatchGlobalEvent(MirrorModel.Events.onDidChangeFlushed, { model });
  },
  lintrc(params) {
    Event.dispatchGlobalEvent('lintrc', params);
  }
}

process.on('message', ({ method, params, trigger }) => {
  try {
    if (messageHandler[method])
      messageHandler[method](params);
  } catch (error) {
    throw new Error(error);
  }
});

global.sendRequest = function(args, len, extra) {
  const { params } = args;
  process.send(Object.assign({}, args, extra));
}

global.getModel = function(uri) {
  return modelsMap.get(uri);
}

global.getAllFileNames = function() {
  return Array.from(modelsMap.keys());
}

function chunkString(str, length) {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}
