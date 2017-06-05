const IPC = require('node-ipc').IPC;
const CLIEngine = require("eslint").CLIEngine;
const jshint = require('jshint');
const { CSSLint } = require('csslint');

const airbnb = {
  useEslintrc: false,
  envs: ['browser', 'es6'],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  rules: {
    'accessor-pairs': 'off',
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    complexity: ['off', 11],
    'class-methods-use-this': ['error', {
      exceptMethods: [],
    }],
    'consistent-return': 'error',
    curly: ['error', 'multi-line'],
    'default-case': ['error', { commentPattern: '^no default$' }],
    'dot-notation': ['error', { allowKeywords: true }],
    'dot-location': ['error', 'property'],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'guard-for-in': 'error',
    'no-alert': 'warn',
    'no-caller': 'error',
    'no-case-declarations': 'error',
    'no-div-regex': 'off',
    'no-else-return': 'error',
    'no-empty-function': ['error', {
      allow: [
        'arrowFunctions',
        'functions',
        'methods',
      ]
    }],
    'no-empty-pattern': 'error',
    'no-eq-null': 'off',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-fallthrough': 'error',
    'no-floating-decimal': 'error',
    'no-global-assign': ['error', { exceptions: [] }],
    'no-native-reassign': 'off',
    'no-implicit-coercion': ['off', {
      boolean: false,
      number: true,
      string: true,
      allow: [],
    }],
    'no-implicit-globals': 'off',
    'no-implied-eval': 'error',
    'no-invalid-this': 'off',
    'no-iterator': 'error',
    'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-magic-numbers': ['off', {
      ignore: [],
      ignoreArrayIndexes: true,
      enforceConst: true,
      detectObjects: false,
    }],
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'acc', // for reduce accumulators
        'e', // for e.returnvalue
        'ctx', // for Koa routing
        'req', // for Express requests
        'request', // for Express requests
        'res', // for Express responses
        'response', // for Express responses
        '$scope', // for Angular 1 scopes
      ]
    }],
    'no-proto': 'error',
    'no-redeclare': 'error',
    'no-restricted-properties': ['error', {
      object: 'arguments',
      property: 'callee',
      message: 'arguments.callee is deprecated',
    }, {
      property: '__defineGetter__',
      message: 'Please use Object.defineProperty instead.',
    }, {
      property: '__defineSetter__',
      message: 'Please use Object.defineProperty instead.',
    }, {
      object: 'Math',
      property: 'pow',
      message: 'Use the exponentiation operator (**) instead.',
    }],
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-script-url': 'error',
    'no-self-assign': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'off',
    'no-unused-expressions': ['error', {
      allowShortCircuit: false,
      allowTernary: false,
      allowTaggedTemplates: false,
    }],
    'no-unused-labels': 'error',
    'no-useless-call': 'off',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'no-warning-comments': ['off', { terms: ['todo', 'fixme', 'xxx'], location: 'start' }],
    'no-with': 'error',
    'prefer-promise-reject-errors': ['off', { allowEmptyReject: true }],
    radix: 'error',
    'require-await': 'off',
    'vars-on-top': 'error',
    'wrap-iife': ['error', 'outside', { functionPrototypeMethods: false }],
    yoda: 'error'
  }
};

const cli = new CLIEngine(airbnb);

let registry;
let monaco;

const handleJsonLint = (data, callback) => {
  jshint.JSHINT(data);
  const results = [];
  const messages = jshint.JSHINT.data();
  const errors = (messages && messages.errors) || [];
  errors.filter(function (e) { return !!e; }).forEach(function (error) {
    results.push({
      fatal: true,
      // ruleId: "bad-json",
      severity: 3,
      message: error.reason,
      // source: error.evidence,
      line: error.line,
      column: error.character
    });
  });
  callback(results);
}

// server
const activate = (callback) => {
  const ipc = new IPC();
  ipc.config.id = 'eslintServer';
  ipc.config.silent = false;
  ipc.serve(() => {
    ipc.server.on(
      'javascript',
      (data, socket) => {
        const { results } = cli.executeOnText(data, 'source.js');
        ipc.log(results);
        const { messages } = results[0];
        const messagesString = JSON.stringify(messages);
        ipc.log(messagesString);
        ipc.server.emit(
          socket,
          'message',
          messagesString
        );
      }
    );

    ipc.server.on(
      'json',
      (data, socket) => {
        handleJsonLint(data, (messages) => {
          const messagesString = JSON.stringify(messages);
          ipc.server.emit(
            socket,
            'message',
            messagesString
          );
        })
      }
    );

    ipc.server.on(
      'css',
      (data, socket) => {
        const { messages } = CSSLint.verify(data);
        const messagesString = JSON.stringify(messages.map(message => {
          return {
            severity: message.type === "warning" ? 2 : 3,
            fatal: message.type === "warning" ? false : true,
            line: message.line,
            column: message.evidence,
            message: message.message,
          }
        }));
        ipc.server.emit(
          socket,
          'message',
          messagesString
        );
      }
    )

    callback();
  })

  ipc.server.start();
};

// client
const initClient = (callback) => {
  const ipc = new IPC();
  ipc.config.id = 'eslint';
  ipc.config.silent = true;
  ipc.connectTo(
    'eslintServer',
    () => {
      ipc.of.eslintServer.on(
        'connect',
        () => {
          monaco.editor.onDidCreateModel((model) => {
            const modeId = model.getModeId();

            ipc.log(modeId);

            if (modeId === 'javascript' || modeId === 'json' || modeId === 'css') {
              const value = model.getValue();
              ipc.of.eslintServer.emit(modeId, value);
              model.onDidChangeContent((e) => {
                const value = model.getValue();
                ipc.of.eslintServer.emit(modeId, value);
              })
            }
          })
        }
      );

      ipc.of.eslintServer.on(
        'message',
        (str) => {
          const markers = JSON.parse(str);
          registry.setCurrentModelMarkers('eslint', markers.map((marker) => {
            const { severity, line, column, fatal, message } = marker;
            return {
              severity: fatal ? 3 : severity,
              message: `[eslint] ${message}`,
              startLineNumber: line,
              startColumn: column,
            }
          }));
        }
      )
    });
}

module.exports = (r, m) => {
  registry = r;
  monaco = m;
  activate(initClient);
}
