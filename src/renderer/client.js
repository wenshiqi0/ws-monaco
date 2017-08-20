import net from 'net';
import { join } from 'path';
import Event from './event';

class ChunkQueue {
  constructor() {
    this._queueMap = new Map();
    this._callbackMap = new Map();
  }

  pushChunk(method, chunk) {
    const callback = this._callbackMap.get(method);
    let chunks = this._queueMap.get(method);
    if (!chunks || chunk.timestamp > chunks.timestamp) {
      chunks = {};
      chunks.timestamp = chunk.timestamp;
    }
    if (chunks && chunk.timestamp < chunks.timestamp)
      return;
    chunks[chunk.index] = chunk;

    if ((Object.keys(chunks).length - 1) === chunk.size) {
      let data = '';
      for (let i = 0; i < chunk.size; i++)  {
        data += chunks[i].params;
      }
      this._queueMap.set(method, null);
      const json = JSON.parse(data);
      callback({ params: json });
    } else {
      this._queueMap.set(method, chunks);
    }
  }

  registerCallback(method, callback) {
    this._callbackMap.set(method, callback);
  }
}
const chunkQueue = new ChunkQueue();

let remaining = '';

function safeParseJSON(text) {
  try {
    const res = JSON.parse(text);
    return res;
  } catch (error) {
    return false;
  }
}

export default function init() {
  const socket = new net.Socket();
  global.socket = socket;
  socket.connect(12345);
  socket.write(JSON.stringify({ method: 'lintrc', params: global.lintrc }) + '\s\s\s\n');
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
        if (res) {
          events.push(res);
        }
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

    events.forEach((args) => {
      handleEvent(args);      
    })
  })
}

function handleEvent(params) {
  const { method, log, error, chunk, trigger } = params || {};
  if (error) {
    // remote log
    console.error(params);
  } else if (log) {
    // remote error
    console.log(params);
  } else if (chunk) {
    handleChunk(method, params, (data) => {
      if (trigger)
        Event.doGlobalTrigger(method, data);
      else
        Event.dispatchGlobalEvent(method, data);
    });
  } else {
    // handle event
    if (trigger)
      Event.doGlobalTrigger(method, params);
    else
      Event.dispatchGlobalEvent(method, params);
  }
}

function handleChunk(method, chunk, callback) {
  chunkQueue.registerCallback(method, callback);
  chunkQueue.pushChunk(method, chunk);
}
