import Promise from 'bluebird';

export class Event {
  constructor(type) {
    this._eventsMap = new Map();
  }

  addListenerEvent(event, func) {
    const methods = this._eventsMap.get(event) || new Set();
    methods.add(func);
    this._eventsMap.set(event, methods);
  }

  removeListener(event, func) {
    const methods = this._eventsMap.get(event);
    if (methods && methods.has(func))
      methods.delete(event);
  }

  removeAllListeners(event) {
    const methods = this._eventsMap.get(event);
    if (methods)
      methods.clear();
  }

  addListenerEventOnce(event, func) {
    const methods = this._eventsMap.get(event) || new Set();
    methods.add(() => {
      func();
      this._eventsMap.delete(event);
    });
    this._eventsMap.set(event, methods);
  }

  dispatchEvent(event, args) {
    const methods = this._eventsMap.get(event) || new Set();
    async function doPromise() {
      for (const method of methods.values()) {
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

  static addGlobalListenerEvent(event, func) {
    globalEvent.addListenerEvent(event, func);
  }

  static removeGlobalListener(even, func) {
    globalEvent.removeListener(event, func);    
  }

  static removeGlobalAllListeners(event) {
    globalEvent.removeAllListeners(event);        
  }
}

export class EventEmitter {
  constructor () {
    this._symbol = Symbol('event');
    this._event = null;
    this._callbacks = new Set();
  }

  get event() {
    if (!this._event) {
      this._event = (callback, params, disposes) => {
        const callbackWithArgs = { callback, params };
        this._callbacks.add(callbackWithArgs);

        const result = {
					dispose: () => {
						result.dispose = EventEmitter._noop;
						if (!this._disposed) {
              this._callbacks.delete(callbackWithArgs);
              /*
							if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
								this._options.onLastListenerRemove(this);
              }
              */
						}
					}
        };

        if (Array.isArray(disposes)) {
					disposes.push(result);
        }

        return result;
      }
    }

    return this._event;
  }

  async fire() {
    const callbacks = this._callbacks;
    async function doPromise() {
      for (const item of callbacks.values()) {
        const { callback, params } = item;
        await new Promise((resolve) => {
          resolve(callback(params));
        })
      }
    }
    await doPromise();
  }

  dispose() {
    this._callbacks.clear();
    this._callbacks = undefined;
    this._disposed = true;
  }
}

EventEmitter._noop = () => {};

const globalEvent = new Event();
window.__GLOBAL_EVENT__ = globalEvent;
