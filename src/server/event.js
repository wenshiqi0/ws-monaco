export default class Event {
  constructor(type) {
    this._eventsMap = new Map();
    this._triggerMap = new Map();
  }

  addListenerEvent(event, func) {
    const methods = this._eventsMap.get(event) || [];
    methods.push(func);
    this._eventsMap.set(event, methods);
  }

  addListenerEventOnce(event, func) {
    const methods = this._eventsMap.get(event) || [];
    methods.push(() => {
      func();
      this._eventsMap.delete(event);
    });
    this._eventsMap.set(event, methods);
  }

  addTrigger(event, func) {
    const methods = this._triggerMap.get(event) || [];
    methods.push(func);
    this._triggerMap.set(event, methods);
  }

  doTrigger(event) {
    const self = this;
    const methods = this._triggerMap.get(event) || [];
    async function doPromise() {
      for (const method of methods) {
        await new Promise((resolve) => {
          resolve(method());
        })
      }
      self._triggerMap.delete(event);
    }
    doPromise();
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

  static addTrigger(event, func) {
    globalEvent.addTrigger(event, func);
  }

  static doTrigger(event) {
    globalEvent.doTrigger(event);
  }

  static addLocalListenerEvent(local, event, func) {
    if (local.addListenerEvent && typeof local.addListenerEvent === 'function')
      local.addListenerEvent(event, func);
  }
}

const globalEvent = new Event();
