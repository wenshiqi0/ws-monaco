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
      append: () => {},
      dispose: () => {},
      show: () => {},
    };
  }

  showErrorMessage(message) {
    console.error(message)    
  }

  showInformationMessage(message) {
    console.info(message)
  }

  onDidChangeActiveTextEditor(callback) {
    Event.addGlobalListenerEvent('onDidChangeActiveTextEditor', callback);
  }
}

const window = new Window();

export default window;