function lookUp(tree, key) {
  if (key) {
    const parts = key.split('.');
    let node = tree;
    for (let i = 0; node && i < parts.length; i++) {
      node = node[parts[i]];
    }
    return node;
  }
}

const configure = {
  valueTree: {
    typescript: {
      tsserver: {
        trace: 'off'
      }
    },
    tsdk_version: '2.4.2'
  }
};

export function getConfiguration(section) {
  const config = section
    ? lookUp(configure.valueTree, section)
    : configure.valueTree;

  const result = {
    has(key) {
      return typeof lookUp(config, key) !== 'undefined';
    },
    get(key, defaultValue) {
      let result = lookUp(config, key);
      if (typeof result === 'undefined') {
        result = defaultValue;
      }
      return result;
    },
    update: (key, value, global) => {
      /*
      global = global || false;
      key = section ? `${section}.${key}` : key;
      const target = global ? ConfigurationTarget.USER : ConfigurationTarget.WORKSPACE;
      if (value !== void 0) {
        return this._proxy.$updateConfigurationOption(target, key, value);
      } else {
        return this._proxy.$removeConfigurationOption(target, key);
      }
      */
    },
    inspect: (key) => {
      /*
      key = section ? `${section}.${key}` : key;
      const config = this._configuration.data[key];
			if (config) {
				return {
          key,
          defaultValue: config.default,
					globalValue: config.user,
					workspaceValue: config.workspace
				};
			}
      return undefined;
      */
		}
	};

  /*
	if (typeof config === 'object') {
    mixin(result, config, false);
  }
  */

	return Object.freeze(result);
}