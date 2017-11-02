import { platform } from 'os';
import { join } from 'path';
import { getMainWorkspace } from '../ant/workspace';

/**
 * schema regex
 */
const schemeReg = /^([a-zA-Z0-9\-]*)\:\/\//;
/**
 * authority regex
 */
const authorityReg = /\:\/\/([a-zA-Z0-9\.\-\u4e00-\u9eff]*)\//;
/**
 * path regex
 */
const pathReg = platform() === 'win32' ? /([A-Z]\:[\/\\][a-zA-Z0-9\.\-\/\\\u4e00-\u9eff]*)/ : /[a-zA-Z]\/([a-zA-Z0-9\/\-\.\u4e00-\u9eff]*)\??/;
const noAuthorityReg = platform() === 'win32' ? /([A-Z]\:[\/\\][a-zA-Z0-9\.\-\/\\\u4e00-\u9eff]*)/ : /\:\/\/\/([a-zA-Z0-9\/\-\.\u4e00-\u9eff]*)\??/;

/**
 * A universal resource identifier representing either a file on disk
 * or another resource, like untitled resources.
 */
export default class Uri {
  /**
   * Create a URI with schema, path and authority.
   * 
   * @param {string} scheme
   * @param {string} path 
   * @param {string} authority 
   */
  constructor(scheme, authority, path) {
    /**
		 * Scheme is the `http` part of `http://www.msft.com/some/path?query#fragment`.
		 * The part before the first colon.
		 */
    this._scheme = scheme;

    /**
		 * Path is the `/some/path` part of `http://www.msft.com/some/path?query#fragment`.
		 */
    this._path = path;

    /**
		 * Authority is the `www.msft.com` part of `http://www.msft.com/some/path?query#fragment`.
		 * The part between the first double slashes and the next slash.
		 */
    this._authority = authority;
  }

  get scheme() {
    return this._scheme;
  }

  get fsPath() {
    if (this._scheme === 'file')
      return this._path;
    return null;
  }

  /**
   * Create an URI from a file system path. The [scheme](#Uri.scheme)
   * will be `file`.
   * 
   * @param {string} path A file system or UNC path.
   * @return A new Uri instance. 
   */
  static file(path) {
    return new Uri('file', '', path);
  }

  /**
   * Create an URI from a relative file system path. The [scheme](#Uri.scheme)
   * will be `file`.
   * 
   * @param {string}  path A file system or UNC relative path.
   * @return A new Uri instance. 
   */
  static relativeFile(path) {
    const { uri } = getMainWorkspace() || {};
    if (!uri) return null;
    return new Uri('file', '', join(uri.fsPath, path));
  }

  /**
   * Create an URI from a string. Will throw if the given value is not
   * valid.
   * 
   * @param {string} str The string value of an Uri.
   * @return A new Uri instance.
   */
  static parse(str) {
    const scheme = getScheme(str);
    const authority = getAuthority(str);
    const path = getPath(str);

    return new Uri(scheme, authority, path);
  }

  /**
 * Derive a new Uri from this Uri.
 *
 * ```ts
 * let file = Uri.parse('before:some/file/path');
 * let other = file.with({ scheme: 'after' });
 * assert.ok(other.toString() === 'after:some/file/path');
 * ```
 *
 * @param {Object} change An object that describes a change to this Uri. To unset components use `null` or
 *  the empty string.
 * @return A new Uri that reflects the given change. Will return `this` Uri if the change
 *  is not changing anything.
 */
  with(change) {
    const { scheme, authority, path } = change;
    this._scheme = scheme || this._scheme;
    this.authority = authority || this._authority;
    this._path = path || this._path;
  }

  /**
   * Returns a string representation of this Uri. The representation and normalization
   * of a URI depends on the scheme. The resulting string can be safely used with
   * [Uri.parse](#Uri.parse).
   *
   * @return A string representation of this Uri.
   */
  toString() {
    return `${this._scheme}://${platform() === 'win32' ? '/' : ''}${this._authority}${this._path}`.replace(/\\/g, '/');
  }

/**
 * Returns a JSON representation of this Uri.
 *
 * @return An object.
 */
  toJSON() {
    return {
      schema: this._scheme,
      authority: this._authority,
      path: this._path,
    }
  }
}

/**
 * Get the schema from a string uri.
 * 
 * @param {string} uri
 * @return matched string
 */
function getScheme(uri) {
  const matched = uri.match(schemeReg);
  if (matched.length > 1)
    return matched[1];
  return '';
}

/**
 * Get the authority from string uri.
 * 
 * @param {string} uri
 * @return matched string
 */
function getAuthority(uri) {
  const matched = uri.match(authorityReg);
  if (matched.length > 1)
    return matched[1];
  return '';
}

/**
 * Get the path from string uri.
 * 
 * @param {string} uri
 * @return matched string
 */
function getPath(uri) {
  const matched = uri.match(uri.indexOf('///') > 0 ? noAuthorityReg : pathReg);
  if (matched.length > 1) {
    if (matched[1][0] !== '/' && platform() !== 'win32') return `/${matched[1]}`;
    return matched[1].replace(/\\/g, '/');
  }
  return '';
}

