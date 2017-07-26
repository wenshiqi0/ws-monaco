import { ipcMain as ipc } from 'electron';
import { existsSync } from 'fs';
import { CSSLint } from 'ant-csslint';
import { CLIEngine } from 'eslint';
import jshint from 'jshint';

let cli = null;

export function NewCLIEngine(configFile) {
  if (existsSync(configFile)) {
    try {
      cli = new CLIEngine({
        configFile,
      });
    } catch (error) {
      cli = null;
      console.error('NewCLIEngine ERROR', error);
    }
  } else {
    cli = null;
  }
}

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

ipc.on(
  'eslint:javascript',
  (event, arg) => {
    if (!cli) return;
    const { results } = cli.executeOnText(arg, 'source.js');
    const { messages } = results[0];
    event.sender.send('eslint:return', messages);
  }
);

ipc.on(
  'eslint:json',
  (event, arg) => {
    handleJsonLint(arg, (messages) => {
      event.sender.send('eslint:return', messages)
    })
  }
);

ipc.on(
  'eslint:css',
  (event, arg) => {
    const { messages } = CSSLint.verify(arg, {
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
    event.sender.send('eslint:return', results);
  }
)