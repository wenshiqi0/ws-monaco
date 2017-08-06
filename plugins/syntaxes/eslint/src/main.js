import { ipcMain as ipc } from 'electron';
import { existsSync } from 'fs';
import { CSSLint } from 'ant-csslint';
import { CLIEngine } from 'eslint';
import jshint from 'jshint';
import Event from '../../../../src/event';
import MirrorModel from '../../../../src/server/mirrorModel';
import { WorkQueue } from '../../utils';

const workQueue = new WorkQueue();

export function NewEsLintCLIEngine(configFile) {
  if (existsSync(configFile)) {
    try {
      cli = new CLIEngine({
        configFile,
      });
    } catch (error) {
      cli = null;
      console.error('NewEsLintCLIEngine ERROR', error);
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

ipc.on('eslint:getMarkers', (event, { language, uri }) => {
  const model = Ant.modelsMap.get(uri);

  switch (language) {
    case 'javascript':
      {
        const text = model.getText();
        const { results } = cli.executeOnText(text, 'source.js');
        const { messages } = results[0];
        event.sender.send(`eslint:getMarkers`, messages);
      }
      break;

    case 'json':
      {
        const text = model.getText();
        handleJsonLint(text, (messages) => {
          event.sender.send('eslint:getMarkers', messages);
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
        event.sender.send('eslint:getMarkers', messages);
      }
      break;

    default:
      break;
  }
})


/*
Event.addGlobalListenerEvent(MirrorModel.Events.onCreateModel, ({ event, model, language }) => {
  let callback;

  switch (language) {
    case 'javascript':
      callback = ({ event, model }) => {
        const text = model.getText();
        const { results } = cli.executeOnText(text, 'source.js');
        const { messages } = results[0];
        // event.sender.send('eslint:return', messages);
      };

      callback({ event, model });
      Event.addLocalListenerEvent(model, MirrorModel.Events.onContentChange, callback);
      break;

    case 'json':
      callback = ({ event, model }) => {
        const text = model.getText();
        handleJsonLint(text, (messages) => {
          event.sender.send('eslint:return', messages)
        })
      };
      
      callback({ event, model });
      Event.addLocalListenerEvent(model, MirrorModel.Events.onContentChange, callback)
      break;

    case 'css':
      callback = ({ event, model }) => {
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
        event.sender.send('eslint:return', results);
      }

      callback({ event, model });
      Event.addLocalListenerEvent(model, MirrorModel.Events.onContentChange, callback);
      break;
  
    default:
      break;
  }
});
*/
