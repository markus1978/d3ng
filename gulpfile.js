'use strict';

const path = require('path');
require('ts-node').register({
  project: path.join(__dirname, './src/tools/tsconfig.json')
});
require('./src/tools/gulpfile.lib');
