import { Event } from './Event';

class StatusBarItem {
  constructor (level) {
    this.level = level;
    this.text = '';
    this.color = '';
    this.tooltip = '';
    this.command = '';
  }
  hide() {}
  show() {
    console.log(`[${this.color}] ${this.tooltip}`);
  }
}

class Window {
  createStatusBarItem(level) {
    return new StatusBarItem(level);
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