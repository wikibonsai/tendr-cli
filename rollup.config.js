// `rollup.config.js` adapted from the following sources
// https://hackernoon.com/building-and-publishing-a-module-with-typescript-and-rollup-js-faa778c85396
// https://github.com/alexjoverm/typescript-library-starter/blob/master/rollup.config.ts
// https://github.com/landakram/micromark-extension-wiki-link/blob/master/rollup.config.js

// package.json
// todo: upgrade rollup; use esm
// import pkg from './package.json' assert { type: 'json' };
import pkg from './package.json';

// rollup plugins
import ts from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';


// configuration shared by esm / cjs / es
const shared = {
  // dependencies will be installed by the consumer,
  // so tell rollup not to bundle them with the package
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ],
};

// babel plugin
const babelPlugin = babel({
  babelHelpers: 'runtime',
  exclude: ['node_modules/**']
});

// esm-only configuration
const esm = {
  ...shared,
  input: pkg.source,
  output: [
    {
      file: pkg.browser,
      format: 'esm',
      sourcemap: true,
      name: pkg.name,
      banner: `// ${pkg.name} v${pkg.version} - ${pkg.repository.url}`,
    }
  ],
  plugins: [
    ts({transpiler: 'babel'}),
    commonjs(),
    babelPlugin,
    preserveShebangs(),
  ],
};

// cjs/es-only configuration
const cjs_es = {
  ...shared,
  input: pkg.source,
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      name: pkg.name,
      banner: `// ${pkg.name} v${pkg.version} - ${pkg.repository.url}`,
    },{
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      name: pkg.name,
      banner: `// ${pkg.name} v${pkg.version} - ${pkg.repository.url}`,
    }
  ],
  plugins: [
    ts({transpiler: 'babel'}),
    commonjs(),
    babelPlugin,
    preserveShebangs(),
  ]
};

export default [esm, cjs_es];
