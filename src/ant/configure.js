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

export const configure = {
  valueTree: {
    typescript: {
      disableAutomaticTypeAcquisition: false,
      npm: null,
      check: {
        npmIsInstalled: false,
      },
      format: {
        enable: true,
        placeOpenBraceOnNewLineForFunctions: false,
        placeOpenBraceOnNewLineForFunctions: false,
        insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        insertSpaceBeforeFunctionParenthesis: false,
        insertSpaceAfterFunctionKeywordForAnonymousFunctions: true,
        insertSpaceAfterKeywordsInControlFlowStatements: true,
        insertSpaceBeforeAndAfterBinaryOperators: true,
        insertSpaceAfterSemicolonInForStatements: true,
        insertSpaceAfterConstructor: false,
        insertSpaceAfterCommaDelimiter: true,
      },
    },
    javascript: {
      format: {
        enable: true,
        placeOpenBraceOnNewLineForFunctions: false,
        placeOpenBraceOnNewLineForFunctions: false,
        insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        insertSpaceBeforeFunctionParenthesis: false,
        insertSpaceAfterFunctionKeywordForAnonymousFunctions: true,
        insertSpaceAfterKeywordsInControlFlowStatements: true,
        insertSpaceBeforeAndAfterBinaryOperators: true,
        insertSpaceAfterSemicolonInForStatements: true,
        insertSpaceAfterConstructor: false,
        insertSpaceAfterCommaDelimiter: true,
      },
    },
    tsdk_version: '2.4.0',
    css: {
      validate: true,
      trace: {
        server: 'off',
      }
    },
    tslint: {
      enable: false,
      jsEnable: false,
    },
    eslint: {
      enable: true,
      trace: {
        server: 'off',
      },
      options: {},
      run: 'onType',
      autoFixOnSave: false,
      validate: [
        "javascript",
        "javascriptreact"
      ]
    },
    http: {
      proxy: '',
      proxyStrictSSL: false,
      proxyAuthorization: null,
    },
    json: {
      trace: {
        server: 'off',
      },
      format: {
        enable: true,
      },
      schemas: [],
    },
    html: {
      format: {
        enable: true,
        wrapAttributes: 'auto'
      },
      suggest: {
        html5: true,
      },
      validate: {
        scripts: true,
        styles: true,
      },
      autoClosingTags: true,
      trace: {
        server: 'off',
      }
    }
  },
  lintDisable: 'eslint',
};

export function updateConfiguration(key, value) {
  configure[key] = value;
}

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
      key = section ? `${section}.${key}` : key;
      const config = configure[key];
			if (config) {
				return {
          key,
          defaultValue: config.default,
					globalValue: config.user,
					workspaceValue: config.workspace
				};
			}
      return undefined;
		}
	};

  /*
	if (typeof config === 'object') {
    mixin(result, config, false);
  }
  */

	return Object.freeze(result);
}