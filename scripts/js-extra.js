const fsExtra = require('fs-extra');
const chalk = require('chalk');
const { CompletionItemKind } = require('./utils');

console.log(chalk.green('js extra api start'));

const CONSOLE = {
  entry: 'console',
  methods: {
    assert: {
      "insertText": {
        "value": "assert(${1:assertion: boolean}, ${2:...args: any})"
      },
      "documentation": "Log a message and stack trace to console if first argument is false.",
      "kind": CompletionItemKind.Function,
    },
    clear: {
      "insertText": {
        "value": "clear()"
      },
      "documentation": "Clear the console.",
      "kind": CompletionItemKind.Function,
    },
    count: {
      "insertText": {
        "value": "count(${1:[label]: string[]})"
      },
      "documentation": "Log the number of times this line has been called with the given label.",
      "kind": CompletionItemKind.Function,
    },
    debug: {
      "insertText": {
        "value": "debug(${1:...args: any})"
      },
      "documentation": "An alias for log()",
      "kind": CompletionItemKind.Function,
    },
    error: {
      "insertText": {
        "value": "error(${1:...args: any})"
      },
      "documentation": "Outputs an error message. You may use string substitution and additional arguments with this method.",
      "kind": CompletionItemKind.Function,
    },
    info: {
      "insertText": {
        "value": "info(${1:...args: any})"
      },
      "documentation": "Informative logging information. You may use string substitution and additional arguments with this method.",
      "kind": CompletionItemKind.Function,
    },
    log: {
      "insertText": {
        "value": "log(${1:...args: any})"
      },
      "documentation": "For general output of logging information. You may use string substitution and additional arguments with this method.",
      "kind": CompletionItemKind.Function,
    },
    time: {
      "insertText": {
        "value": "time(${1:label: string})"
      },
      "documentation": "Starts a timer with a name specified as an input parameter. Up to 10,000 simultaneous timers can run on a given page.",
      "kind": CompletionItemKind.Function,
    },
    timeEnd: {
      "insertText": {
        "value": "timeEnd(${1:label: string})"
      },
      "documentation": "Stops the specified timer and logs the elapsed time in seconds since its start.",
      "kind": CompletionItemKind.Function,
    },
    warn: {
      "insertText": {
        "value": "warn(${1:...args: any})"
      },
      "documentation": "Outputs a warning message. You may use string substitution and additional arguments with this method.",
      "kind": CompletionItemKind.Function,
    },
  }
}

fsExtra.writeJsonSync(`./plugins/api/javascript/${CONSOLE.entry}.json`, CONSOLE);

console.log(chalk.green('js extra api completed'));
