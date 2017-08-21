import MirrorModel from './mirrorModel';
import Event from './event';
import initServer from './tcp'; 

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

let remaining = '';

function safeParseJSON(text) {
  try {
    const res = JSON.parse(text);
    return res;
  } catch (error) {
    return false;
  }
}

initServer((socket) => {
  socket.on('end', () => {
    console.log('one socket end');
    global.socket = null;
  })
  socket.on('data', (data) => {
    const events = [];
    try {
      const stringData = `${remaining}${data.toString('utf-8')}` || '{}';            
      const mutipleObjString = stringData.split('\s\s\s\n');
      if (mutipleObjString.length === 2 && !mutipleObjString[1] && !safeParseJSON(mutipleObjString[0])) {
        return remaining + stringData;
      }

      const last = mutipleObjString.pop();

      // We only use the last object string.
      // If the data is not completed, we store it and use the last one.
      // FIX ME: all the method will come to here, may some repeat methods.
      mutipleObjString.forEach((one) => {
        const res = safeParseJSON(one);
        if (res)
          events.push(res);
      })
      if (last) {
        const res = safeParseJSON(last);
        if (res) {
          remaining = '';
          events.push(res);
        } else {
          remaining = last;
        }
      } else {
        remaining = '';        
      }
    } catch (e) {
      console.error(e);
      remaining = '';
    }

    events.forEach(args => {
      const { method, params, trigger } = args || {};
      if (trigger) {
        Event.dispatchGlobalEvent(method, params);
      } else if (messageHandler[method]) {
        try {
          messageHandler[method](params);
        } catch (error) {
          throw new Error(error);
        }
      }
    })
  })
})

global.sendRequest = function(args, len, extra) {
  if (!global.socket) return;
  const { params } = args;
  const timestamp = Date.now();
  if (typeof params === 'object') {
    const str = JSON.stringify(params);
    const splited = chunkString(str, len || 512);
    const size = splited.length;
    // 不在分包
    if (true)
      return global.socket.write(JSON.stringify(Object.assign({}, args, extra, { timestamp })) + '\s\s\s\n');
    splited.forEach((chunk, index) => {
      global.socket.write(JSON.stringify(Object.assign({}, args, extra, {
        timestamp, index, size,
        params: chunk,
        chunk: true,
      })) + '\s\s\s\n')
    }, this);
  } else {
    return global.socket.write(JSON.stringify(Object.assign({}, args, extra, { timestamp })) + '\s\s\s\n');
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
