#!/usr/bin/env node
'use strict';

const args = process.argv.slice(2);
const spawn = require('cross-spawn');

const scriptIndex = args.findIndex((x) => x === 'build' || x === 'serve');
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const path = require('path');
const argv = require('yargs-parser')(args);

if (['dev', 'build'].includes(script)) {
    const result = spawn.sync(
        'node ',
        [path.resolve(__dirname, `../commands/${script}.js`), '--port', argv.port],
        {
            stdio: 'inherit'
        }
    );
    if (result.signal) {
        console.log('嘤嘤嘤~失败了呀');
        process.exit(1);
    }
    process.exit(result.status);
} else {
    console.log('Unknown script "' + script + '".');
    console.log('请使用以下脚本：dev,build');
}
