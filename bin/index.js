#! /usr/bin/env node

const yargs = require('yargs');

const usage =
  '\nUsage: npx @devdavi/unflatten <file_name> [<output_dir>] [--wd]';

yargs
  .usage(usage)
  .option('wd', {
    alias: 'with-dependencies',
    describe:
      'Also unflatten external dependencies (e.g openzeppelin). The script will ignore them by default.',
  })
  .help(true).argv;

if (yargs.argv._[0] == null) {
  yargs.showHelp();
}

if (yargs.argv._[0] != null) {
  const fileName = yargs.argv._[0];
  const unflattener = require('../src/unflattener');
  unflattener.execute(fileName, yargs.argv._[1], !!yargs.argv.wd);
}
