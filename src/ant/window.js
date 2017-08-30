import { Event } from './Event';

class Window {
  createStatusBarItem() {
    return {
      text: '',
      tooltip: '',
      command: '',
      hide: () => {},
    }
  }

  createOutputChannel() {
    return {
      appendLine: () => {},
    };
  }

  onDidChangeActiveTextEditor(callback) {
    Event.addGlobalListenerEvent('onDidChangeActiveTextEditor', callback);
  }
}

const window = new Window();

export default window;