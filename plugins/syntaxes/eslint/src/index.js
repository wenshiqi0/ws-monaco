import { ipcRenderer as ipc } from 'electron';
import Event from '../../../../src/renderer/event';

let globalRegistry;
export const activate = (registry) => {
  globalRegistry = registry;
}

Event.addGlobalListenerEvent('onEslintChange', ({ params }) => {
  const messages = params;
  globalRegistry.setCurrentModelMarkers('eslint', messages.map((marker) => {
    const { severity, line, column, fatal, message } = marker;
    return {
      severity: fatal ? 3 : severity,
      message: `[Lint] ${message}`,
      startLineNumber: line,
      startColumn: column,
    }
  }));
})
