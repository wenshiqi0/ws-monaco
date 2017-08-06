import ipc from 'node-ipc';
import os from 'os';

ipc.config = {
  ...ipc.config,
  socketRoot: '/tmp/ant-ide',
  id: 'globalServer',
}

function server() {
}

ipc.server(server);