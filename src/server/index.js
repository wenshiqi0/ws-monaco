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
    Event.doTrigger(MirrorModel.Events.onInitDocument);
  },
  onDidChangeFlushed(params) {
    const { uri, events } = params;
    const model = modelsMap.get(uri);
    model.onEvents(events);

    // update model event
    Event.dispatchGlobalEvent(MirrorModel.Events.onDidChangeFlushed, { model });
    Event.doTrigger(MirrorModel.Events.onDidChangeFlushed);
  },
  lintrc(params) {
    Event.dispatchGlobalEvent('lintrc', params);
  }
}

process.on('message', ({ method, params, trigger }) => {
  if (trigger) {
    Event.dispatchGlobalEvent(method, params);
  } else if (messageHandler[method]) {
    try {
      messageHandler[method](params);
    } catch (error) {
      throw new Error(error);
    }
  }
});

global.sendRequest = function(args, len, extra) {
  const { params } = args;
  const timestamp = Date.now();
  if (typeof params === 'object') {
    const str = JSON.stringify(params);
    const splited = chunkString(str, len || 512);
    const size = splited.length;

    if (splited.length < 512)
      return process.send(Object.assign({}, args, extra, { timestamp }));

    splited.forEach((chunk, index) => {
      process.send(Object.assign({}, args, extra, {
        timestamp, index, size,
        params: chunk,
        chunk: true,
      }))
    }, this);
  } else {
    return process.send(Object.assign({}, args, extra, { timestamp }));
  }
}

global.trigger = function(args, len) {
  const model = modelsMap.get(args.uri || '');
  if (!model) throw new Error('[Trigger] not found this model by uri: ', args.uri);

  // maybe model is not update ready
  global.sendRequest(args, len || 512, {
    trigger: true,
    versionId: model.version,
  });
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
