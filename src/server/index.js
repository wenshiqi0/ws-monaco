import * as cp from 'child_process';
import MirrorModel from './mirrorModel';
import Event from './event';

import '../../plugins/syntaxes/eslint/src/server';

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
}

process.on('message', ({ method, params }) => {
  process.send({
    log: 'true',
    method,
    params,
  });
  if (messageHandler[method]) {
    try {
      messageHandler[method](params);
    } catch (error) {
      throw new Error(error);
    }
  }
});

global.sendRequest = function(args, len) {
  const { params } = args;
  const timestamp = Date.now();
  if (typeof params === 'object') {
    const str = JSON.stringify(params);
    const splited = chunkString(str, len || 512);
    const size = splited.length;

    if (splited.length < 512)
      return process.send(Object.assign({}, args, { timestamp }));

    splited.forEach((chunk, index) => {
      process.send(Object.assign({}, args, {
        timestamp, index, size,
        params: chunk,
        chunk: true,
      }))
    }, this);
  } else {
    return process.send(Object.assign({}, args, { timestamp }));
  }
}

function chunkString(str, length) {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}
