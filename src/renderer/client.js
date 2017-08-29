import { fork } from 'child_process';
import { join } from 'path';
import Event from './event';

let child;
export default function getChildProcess() {
  if (!child) {
    child = fork(join(__dirname, './server.js'));
    child.send({ method: 'lintrc', params: global.lintrc })
    child.on('message', (params) => {
      const { method, error } = params || {};
      console.log(params);
      if (error) {
        // remote log
        console.error(params);
      } else {
        Event.dispatchGlobalEvent(method, params.params);        
      }
    })
  }
  return child;
}

process.on('exit', () => {
  if (child)
    child.kill();
})
