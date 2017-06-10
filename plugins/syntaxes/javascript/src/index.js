import { ipcRenderer as ipc, remote } from 'electron';

export const activate = (registry, monaco) => {
  const languages = monaco.languages;

  languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['*'],
    provideCompletionItems: (model, position, token) => {
      return new Promise(resolve => {
        const handler = (event, args) => {
          console.log(args);
          resolve(args);
        };
        ipc.send('javascript:completions', {
          value: model.getValue(),
          offset: model.getOffsetAt(position),
          position,
        });
        ipc.once('javascript:completions', handler);
        if (token) {
					token.onCancellationRequested(() => {
            console.log('just remove');
            ipc.removeListener('javascript:completions', handler);
						resolve(undefined);
					});
				}
      });
    },
  });

  languages.registerSignatureHelpProvider('javascript', {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp: (model, position, token) => {
      return new Promise(resolve => {
        const handler = (event, args) => {
          resolve(args);
        };
        ipc.send('javascript:signatures', {
          value: model.getValue(),
          offset: model.getOffsetAt(position),
          position,
        });
        ipc.once('javascript:signatures', handler);
        if (token) {
					token.onCancellationRequested(() => {
            ipc.removeListener('javascript:signatures', handler);
						resolve(undefined);
					});
				}
      });
    },
  })
}