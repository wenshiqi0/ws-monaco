const fs  = require('fs');
const path = require('path');
const cp = require('child_process');

const absolute = path.join(__dirname, '../extensions');

fs.readdirSync(absolute).forEach(dir => {
  if (fs.statSync(path.join(absolute, dir)).isDirectory()) {
    cp.spawnSync('npm', ['i'], {
      cwd: path.join(__dirname, '../extensions', dir)
    });

    const server = path.join(__dirname, '../extensions', dir, 'server');
    if (fs.existsSync(server)) {
      cp.spawnSync('npm', ['i'], {
        cwd: server
      });
    }
  }
})