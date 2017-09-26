import Promise from 'bluebird';

export default class Memento {
  constructor() {
    this._storage = new Map();
  }

  get (key, defaultValue) {
    return this._storage.get(key) || defaultValue;
  }

  update(key, value) {
    return new Promise((resolve) => {
      this._storage.set(key, value);      
      resolve(true);
    })
  }
}