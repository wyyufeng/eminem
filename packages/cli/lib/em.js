#!/usr/bin/env node
const commander = require('commander');

const ProjectCreator = require('./tasks/create');
const Generator = require('./tasks/generate');
const program = new commander.Command();
process.on('unhandledRejection', (err) => {
    throw err;
});
program
    .command('create <app-name>')
    .option('--template <template>', '模板名称-vanilla:原生web项目 -reactapp:react项目')
    .description('使用预设的模板创建一个新项目')
    .action((name, arg) => {
        const template = arg.template;
        new ProjectCreator(name, template);
    });

program.command('generate <schematic>').action((schematic) => {
    new Generator(schematic);
});
program.on('command:*', function() {
    console.error(
        'Invalid command: %s\nSee --help for a list of available commands.',
        program.args.join(' ')
    );
    process.exit(1);
});
program.parse(process.argv);
