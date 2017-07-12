import { ipcRenderer as ipc } from 'electron';

export const activate = (registry, monaco) => {
  monaco.editor.onDidCreateModel((model) => {
    const modeId = model.getModeId();
    if (modeId === 'javascript' || modeId === 'json' || modeId === 'css') {
      const value = model.getValue();
      ipc.send(`eslint:${modeId}`, value);
      model.onDidChangeContent((e) => {
        const value = model.getValue();
        ipc.send(`eslint:${modeId}`, value);
      })
    }
  })

  ipc.on(
    'eslint:return',
    (event, markers) => {
      registry.setCurrentModelMarkers('eslint', markers.map((marker) => {
        const { severity, line, column, fatal, message } = marker;
        return {
          severity: fatal ? 3 : severity,
          message: `[Lint] ${message}`,
          startLineNumber: line,
          startColumn: column,
        }
      }));
    }
  )
}
