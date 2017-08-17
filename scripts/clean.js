const fs = require('fs-extra');
const chalk = require('chalk');
const package = require('../package.json');

console.log(chalk.green('remove lib/index.js.map'));
fs.removeSync('./lib/index.js.map');

console.log(chalk.green('remove lib/server.js.map'));
fs.removeSync('./lib/server.js.map');

console.log(chalk.green('clean success, ready for publish'));