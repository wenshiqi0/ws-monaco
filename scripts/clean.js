const fs = require('fs-extra');
const chalk = require('chalk');
const package = require('../package.json');

if (package.main !== 'lib/index.min.js') {
  throw new Error('Please set main entry to "lib/index.min.js".');
}

console.log(chalk.green('remove lib/index.js'));
fs.removeSync('./lib/index.js');

console.log(chalk.green('remove lib/main.js'));
fs.removeSync('./lib/main.js');

console.log(chalk.green('clean success, ready for publish'));