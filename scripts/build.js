const $ = require('./exec.js');
const FS = require('fs');
const Path = require('path');

try { FS.mkdirSync(Path.resolve(__dirname, '../dist')) }
catch (e) {}

let watch = process.env.npm_lifecycle_event === 'start';

$(`ecmarkup src/index.html dist/index.html ${ watch ? '--watch' : '' }`);
