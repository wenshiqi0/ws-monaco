import { ipcRenderer as ipc } from 'electron';

const remote = require('electron').remote;

export const activate = (registry, monaco) => {
  // start main services
  const test = remote.require('./main');
  console.log(test);

  const languages = monaco.languages;

  languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['*'],
    provideCompletionItems: (model, position, token) => {
      return new Promise(resolve => {
        ipc.send('completions', {
          value: model.getValue(),
          offset: model.getOffsetAt(position),
          position,
        });
        ipc.once(
          'completions',
          (event, arg) => {
            resolve(arg);
          }
        )
      });
    },
    resolveCompletionItem: (item) => {
      console.log(item);
    },
  });

  languages.registerSignatureHelpProvider('javascript', {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp: (model, position, token) => {
      return new Promise(resolve => {
        ipc.send('signatures', {
          value: model.getValue(),
          offset: model.getOffsetAt(position),
          position,
        });
        ipc.once(
          'signatures',
          (event, arg) => {
            resolve(arg);
          }
        )
      });
    },
  })
}