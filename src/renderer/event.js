import getChildProcess from './client.js';

let processQueue = [];

export default class Event {
  constructor(type) {
    this._eventsMap = new Map();
  }

  addListenerEvent(event, func) {
    const methods = this._eventsMap.get(event) || [];
    methods.push(func);
    this._eventsMap.set(event, methods);
  }

  dispatchEvent(event, args) {
    const methods = this._eventsMap.get(event) || [];
    async function doPromise() {
      for (const method of methods) {
        await new Promise((resolve) => {
          resolve(method(args));
        })
      }
    }
    doPromise();
  }

  static dispatchGlobalEvent(event, params) {
    globalEvent.dispatchEvent(event, params);
    const child = getChildProcess();
    if (child) {
      if (params.model) {
        params.uri = params.model.uri;
        params.model = null;
      }
      child.send({
        method: event,
        params
      })
    }
  }

  static dispatchLocalEvent(local, event, args) {
    if (local.dispatchEvent && typeof local.dispatchEvent === 'function')
      local.dispatchEvent(event, args);
  }

  static addGlobalListenerEvent(event, func) {
    globalEvent.addListenerEvent(event, func);
  }

  static addGlobalListenerEventOnce(event, func) {
    globalEvent.addListenerEventOnce(event, func);
  }

  static addLocalListenerEvent(local, event, func) {
    if (local.addListenerEvent && typeof local.addListenerEvent === 'function')
      local.addListenerEvent(event, func);
  }

  static addGlobalTrigger(trigger, params, callback, cancel) {
    globalEvent.addTrigger(trigger, params, callback, cancel);
  }

  static doGlobalTrigger(trigger, args) {
    globalEvent.doTrigger(trigger, args);
  }
}

const globalEvent = new Event();

Event.addGlobalListenerEvent('onDidChangeContent', () => {
  processQueue.forEach((process) => {
    process();
  })
  processQueue = [];
})

