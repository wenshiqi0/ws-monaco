import { existsSync } from 'fs';
import { CSSLint } from 'ant-csslint';
import { CLIEngine } from 'eslint';
import jshint from 'jshint';
import Event from '../../../../src/server/event';
import MirrorModel from '../../../../src/server/mirrorModel';

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

let cli;
Event.addGlobalListenerEvent('lintrc', (params) => {
  cli = new CLIEngine({
    configFile: params,
  });
  Event.addGlobalListenerEvent(MirrorModel.Events.onInitDocument, ({ model }) => {
    doParse(model);
    Event.addGlobalListenerEvent(MirrorModel.Events.onDidChangeFlushed, ({ model }) => {
      doParse(model);
    });
  });
})

function doParse(model) {
  switch (model.language) {
    case 'javascript':
      {
        const text = model.getText();
        const { results } = cli.executeOnText(text, 'source.js');
        const { messages } = results[0];
        global.sendRequest({ method: 'onEslintChange', params: messages.map(message => Object.assign({}, message, { source: '', fix: '' })).slice(0, 200) });
      }
      break;

    case 'json':
      {
        const text = model.getText();
        handleJsonLint(text, (messages) => {
          global.sendRequest({ method: 'onEslintChange', params: messages });
        })
      }
      break;

    case 'css':
      {
        const text = model.getText();
        const { messages } = CSSLint.verify(text, {
          "order-alphabetical": false
        });
        const results = messages.map(message => {
          return {
            severity: message.type === "warning" ? 2 : 3,
            fatal: message.type === "warning" ? false : true,
            line: message.line,
            column: message.evidence,
            message: message.message,
          }
        })
        global.sendRequest({ method: 'onEslintChange', params: messages });
      }
      break;

    default:
      break;
  }
}
