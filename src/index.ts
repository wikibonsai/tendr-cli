#!/usr/bin/env node

import { tendr } from './tendr';

tendr(process.argv.slice(2), 'dev').argv;

// todo: once package.json imports work in esm (see tendr.ts):
// - tendr.ts:
//   - update package.json import
//   - remove 'env' var from 'tendr'
//   - delete 'getPkgObj()'
// - cli.ts:
//   - remove 'prod' from 'tendr' call
// - index.ts:
//   - delete file
// - package.json:
//   - update 'yarn tendr'
