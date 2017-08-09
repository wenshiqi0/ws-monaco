import { ipcRenderer as ipc } from 'electron';
import Event from '../../../../src/renderer/event';

let globalRegistry;
export const activate = (registry) => {
  globalRegistry = registry;
}

let done = true;
const processQueue = [];

Event.addGlobalListenerEvent('onEslintChange', ({ params }) => {
  const messages = params;

  processQueue.push(messages);

  doQueue();
})

function doQueue() {
  if (!done) return;
  const messages = (processQueue || []).shift();
  if (messages)
    setMarkers(messages);
  else
    done = true; return;

  if (processQueue.length)
    setTimeout(function() {
      doQueue();
    }, 100);
  else
    done = true; return;
}

function setMarkers(messages) {
  globalRegistry.setCurrentModelMarkers('eslint', messages.map((marker) => {
    const { severity, line, column, fatal, message } = marker;
    return {
      severity: fatal ? 3 : severity,
      message: `[Lint] ${message}`,
      startLineNumber: line,
      startColumn: column,
    }
  }));
}
