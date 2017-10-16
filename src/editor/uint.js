export const Constants = {
  MAX_SAFE_SMALL_INTEGER: 1 << 30,
  MIN_SAFE_SMALL_INTEGER: -(1 << 30),
  MAX_UINT_8: 255, // 2^8 - 1
  MAX_UINT_16: 65535, // 2^16 - 1
  MAX_UINT_32: 4294967295, // 2^32 - 1
}
export function toUint8(v) {
  if (v < 0) {
    return 0;
  }
  if (v > Constants.MAX_UINT_8) {
    return Constants.MAX_UINT_8;
  }
  return v | 0;
}

export function toUint32(v) {
  if (v < 0) {
    return 0;
  }
  if (v > Constants.MAX_UINT_32) {
    return Constants.MAX_UINT_32;
  }
  return v | 0;
}

export function toUint32Array(arr) {
  let len = arr.length;
  let r = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    r[i] = toUint32(arr[i]);
  }
  return r;
}

export class Uint8Matrix {
  constructor(rows, cols, defaultValue) {
    let data = new Uint8Array(rows * cols);
    for (let i = 0, len = rows * cols; i < len; i++) {
      data[i] = defaultValue;
    }

    this._data = data;
    this._rows = rows;
    this._cols = cols;
  }

  get(row, col) {
    return this._data[row * this._cols + col];
  }

  set(row, col, value) {
    this._data[row * this._cols + col] = value;
  }
}