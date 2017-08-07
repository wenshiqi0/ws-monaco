import { fork } from 'child_process';
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

let child;
export default function getChildProcess() {
  if (!child) {
    child = fork(join(__dirname, './server.js'));
    child.send({ method: 'lintrc', params: global.lintrc })
    child.on('message', (params) => {
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
    })
  }
  return child;
}

function handleChunk(method, chunk, callback) {
  chunkQueue.registerCallback(method, callback);
  chunkQueue.pushChunk(method, chunk);
}

process.on('exit', () => {
  if (child)
    child.kill();
})
