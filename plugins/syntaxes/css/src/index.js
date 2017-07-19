import { ipcRenderer as ipc, remote } from 'electron';

export const activate = (registry, monaco) => {
  const languages = monaco.languages;

  languages.registerCompletionItemProvider('css', {
    triggerCharacters: [' ', ':'],
    provideCompletionItems: (model, position, token) => {
      return new Promise(resolve => {
        ipc.once('style:completions', (event, args) => {
          console.log(args);
          resolve(args);
        });
        if (token) {
          token.onCancellationRequested(() => {
            ipc.removeAllListeners('style:completions');
            resolve(undefined);
          });
        }
        ipc.send('style:completions', {
          value: model.getValue(),
          offset: model.getOffsetAt(position),
          languageId: 'css',
          position,
        });
      });
    },
  });

  languages.registerCompletionItemProvider('less', {
    triggerCharacters: [' ', ':'],
    provideCompletionItems: (model, position, token) => {
      return new Promise(resolve => {
        ipc.once('style:completions', (event, args) => {
          console.log(args);
          resolve(args);
        });
        if (token) {
          token.onCancellationRequested(() => {
            ipc.removeAllListeners('style:completions');
            resolve(undefined);
          });
        }
        ipc.send('style:completions', {
          value: model.getValue(),
          offset: model.getOffsetAt(position),
          languageId: 'less',
          position,
        });
      });
    },
  });

  /*
  languages.registerSignatureHelpProvider('css', {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp: (model, position, token) => {
      return new Promise(resolve => {
        ipc.once('css:signatures', (event, args) => resolve(args));
        if (token) {
          token.onCancellationRequested(() => {
            ipc.removeAllListeners('javascript:signatures');
            resolve(undefined);
          });
        }
        ipc.send('javascript:signatures', {
          value: model.getValue(),
          offset: model.getOffsetAt(position),
          position,
        });
      });
    },
  })
  */
}