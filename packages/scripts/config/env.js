'use strict';

const fs = require('fs');
const path = require('path');
const util = require('../commands/util');
const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
    throw new Error('The NODE_ENV environment variable is required but was not specified.');
}
var dotenvFiles = [`${util.paths.dotEnv}.${NODE_ENV}`].filter(Boolean);
console.log(dotenvFiles);
dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
        require('dotenv-expand')(
            require('dotenv').config({
                path: dotenvFile
            })
        );
    }
});
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter((folder) => folder && !path.isAbsolute(folder))
    .map((folder) => path.resolve(appDirectory, folder))
    .join(path.delimiter);

function getClientEnvironment() {
    const raw = Object.keys(process.env)
        .filter((env) => {
            return env.includes('EM');
        })
        .reduce(
            (env, key) => {
                console.log(env);
                env[key] = process.env[key];
                return env;
            },
            {
                NODE_ENV: process.env.NODE_ENV || 'development'
            }
        );
    const stringified = {
        'process.env': Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {})
    };

    return { raw, stringified };
}

module.exports = getClientEnvironment;
