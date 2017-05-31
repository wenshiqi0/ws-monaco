const fs = require('fs-extra');
const chalk = require('chalk');

console.log(chalk.green('remove lib/index.js'));
fs.removeSync('./lib/index.js');

console.log(chalk.green('clean success, ready for publish'));