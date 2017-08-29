/**
 * schema regex
 */
const schemaReg = /^([a-zA-Z0-9]*)\:\/\//;
/**
 * authority regex
 */
const authorityReg = /\:\/\/([a-zA-Z0-9\.]*)\//;
/**
 * path regex
 */
const pathReg = /[a-zA-Z]\/([a-zA-Z0-9\/]*)\??/;
const noAuthorityReg = /\:\/\/\/\/([a-zA-Z0-9\/]*)\??/;

/**
 * A universal resource identifier representing either a file on disk
 * or another resource, like untitled resources.
 */
export default class Uri {
  /**
   * Create a URI with schema, path and authority.
   * 
   * @param {string} schema 
   * @param {string} path 
   * @param {string} authority 
   */
  constructor(schema, authority, path) {
    /**
		 * Scheme is the `http` part of `http://www.msft.com/some/path?query#fragment`.
		 * The part before the first colon.
		 */
    this._schema = schema;

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
   * Create an URI from a string. Will throw if the given value is not
   * valid.
   * 
   * @param {string} str The string value of an Uri.
   * @return A new Uri instance.
   */
  static parse(str) {
    const schema = getSchema(str);
    const authority = getAuthority(str);
    const path = getPath(str);

    return new Uri(schema, authority, path);
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
    const { schema, authority, path } = change;
    this._schema = schema || this._schema;
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
    return `${this._schema}://${this._authority}/${this._path}`;
  }

  /**
 * Returns a JSON representation of this Uri.
 *
 * @return An object.
 */
  toJSON() {
    return {
      schema: this._schema,
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
function getSchema(uri) {
  const matched = uri.match(schemaReg);
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
  const matched = uri.match(uri.indexOf('////') > 0 ? noAuthorityReg : pathReg);
  if (matched.length > 1)
    return matched[1];
  return '';
}

