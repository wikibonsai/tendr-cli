import assert from 'node:assert/strict';
import sinon from 'sinon';

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';

import type { CommandTestCase } from './types';
import { tendr } from '../src/tendr';


const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');
let fakeConsoleLog: any;
let fakeConsoleError: any;
let fakeProcessCwd: any;

const testCmd = (test: CommandTestCase) => () => {
  // go //
  const argv: yargs.Argv = tendr(test.input);
  // console.warn(argv.argv);
  // assert //
  // command
  // @ts-expect-error: Property '_' does not exist on type '{ [x: string]: unknown; format: string; "list-format": string; listFormat: string; "no-prefix": boolean; noPrefix: boolean; _: (string | number)[]; $0: string; } | Promise<{ [x: string]: unknown; format: string; "list-format": string; ... 4 more ...; $0: string; }>'.\nProperty '_' does not exist on type 'Promise<{ [x: string]: unknown; format: string; "list-format": string; listFormat: string; "no-prefix": boolean; noPrefix: boolean; _: (string | number)[]; $0: string; }>'.ts(2339)
  assert.deepStrictEqual(argv.argv._, test.cmd);
  // arguments
  if (test.args) {
    for (const key of Object.keys(test.args)) {
      assert.strictEqual(Object.keys(argv.argv).includes(key), true); // key
      // @ts-expect-error: previous test should validate keys
      assert.strictEqual(argv.argv[key], test.args[key]);             // value
    }
  }
  // options
  if (test.opts) {
    for (const key of Object.keys(test.opts)) {
      assert.strictEqual(Object.keys(argv.argv).includes(key), true); // key
      // @ts-expect-error: previous test should validate keys
      assert.strictEqual(argv.argv[key], test.opts[key]);             // value
    }
  }
  // console output
  assert.strictEqual(fakeConsoleLog.called, true);
  if (fakeConsoleLog.called) {
    assert.strictEqual(fakeConsoleLog.getCall(0).args[0], test.output);
  } else if (fakeConsoleError.called) {
    assert.strictEqual(fakeConsoleError.getCall(0).args[0], test.output);
  } else {
    console.error('console not called');
    assert.fail();
  }
};

describe('tree', () => {

  beforeEach(() => {
    const config: string = 
`[garden]
  root    = 'i.bonsai'
  # attrs   = 'caml'
`;
    const doctypes: string = 
`
[index]
path   = "/index/"
prefix = "i."
# color  = "#F0C61F"
# emoji  = "🗄"
`;
    const bonsai: string = 
`- [[fname-a]]
  - [[fname-b]]
    - [[fname-f]]
  - [[fname-c]]
    - [[fname-g]]
    - [[fname-h]]
    - [[fname-i]]
  - [[fname-d]]
  - [[fname-e]]
`;
    const fnameA: string = '';
    const fnameB: string = '';
    const fnameC: string = '';
    const fnameD: string = '';
    const fnameE: string = '';
    const fnameF: string = '';
    const fnameG: string = '';
    // populate test files
    if (!fs.existsSync(testCwd)) {
      // populate test files
      fs.mkdirSync(testCwd);
    }
    fs.writeFileSync('config.toml', config);
    fs.writeFileSync('t.doc.toml', doctypes);
    fs.writeFileSync(path.join(testCwd, 'i.bonsai.md'), bonsai);
    fs.writeFileSync(path.join(testCwd, 'fname-a.md'), fnameA);
    fs.writeFileSync(path.join(testCwd, 'fname-b.md'), fnameB);
    fs.writeFileSync(path.join(testCwd, 'fname-c.md'), fnameC);
    fs.writeFileSync(path.join(testCwd, 'fname-d.md'), fnameD);
    fs.writeFileSync(path.join(testCwd, 'fname-e.md'), fnameE);
    fs.writeFileSync(path.join(testCwd, 'fname-f.md'), fnameF);
    fs.writeFileSync(path.join(testCwd, 'fname-g.md'), fnameG);
    // fake "current working directory"
    process.cwd = () => testCwd;
    fakeProcessCwd = sinon.spy(process, 'cwd');
    // fake console.log
    console.log = (msg) => msg + '\n';
    fakeConsoleLog = sinon.spy(console, 'log');
    fakeConsoleError = sinon.spy(console, 'error');
  });

  afterEach(() => {
    fs.rmSync('config.toml');
    fs.rmSync('t.doc.toml');
    fs.rmSync(testCwd, { recursive: true });
    fakeConsoleLog.restore();
    fakeConsoleError.restore();
    fakeProcessCwd.restore();
  });

  describe('tree', () => {

    describe('default', () => {

      it('single index file', testCmd({
        input: ['tree'],
        cmd: ['tree'],
        args: {},
        opts: {},
        output:
`\x1B[33mi.bonsai\x1B[39m
\x1B[33m\x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-a\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m├── \x1B[39m\x1B[32mfname-b\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-f\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m├── \x1B[39m\x1B[32mfname-c\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-g\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[2mfname-h\x1B[22m
\x1B[2m\x1B[22m    \x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[2mfname-i\x1B[22m
\x1B[2m\x1B[22m    \x1B[33m├── \x1B[39m\x1B[32mfname-d\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m└── \x1B[39m\x1B[32mfname-e\x1B[39m
\x1B[32m\x1B[39m`,
      }));

      describe('multiple index files', () => {

        beforeEach(() => {
          // add new index file
          const ibranch: string = '- [[fname-j]]\n';
          fs.writeFileSync(path.join(testCwd, 'i.branch.md'), ibranch);
          // append reference to root file
          fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '  - [[i.branch]]\n');
        });

        afterEach(() => {
          fs.rmSync(path.join(testCwd, 'i.branch.md'));
        });

        it('multiple index files', testCmd({
          input: ['tree'],
          cmd: ['tree'],
          args: {},
          opts: {},
          output:
`\x1B[33mi.bonsai\x1B[39m
\x1B[33m\x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-a\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m├── \x1B[39m\x1B[32mfname-b\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-f\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m├── \x1B[39m\x1B[32mfname-c\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-g\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[2mfname-h\x1B[22m
\x1B[2m\x1B[22m    \x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[2mfname-i\x1B[22m
\x1B[2m\x1B[22m    \x1B[33m├── \x1B[39m\x1B[32mfname-d\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m├── \x1B[39m\x1B[32mfname-e\x1B[39m
\x1B[32m\x1B[39m    \x1B[33m└── \x1B[39m\x1B[33mi.branch\x1B[39m
\x1B[33m\x1B[39m        \x1B[33m└── \x1B[39m\x1B[2mfname-j\x1B[22m
\x1B[2m\x1B[22m`,
        }));

      });

    });

    describe.skip('custom config', () => {

      it('root filename', testCmd({
        input: ['tree', '-r', 'custom-bonsai'],
        cmd: ['tree'],
        args: {},
        opts: {
          root: 'custom-bonsai',
          glob: './custom-index/*',
        },
        output:
`
`,
      }));

      it('index files glob', testCmd({
        input: ['tree', '-g', './custom-index/*'],
        cmd: ['tree'],
        args: {},
        opts: {
          root: 'custom-bonsai',
          glob: './custom-index/*',
        },
        output:
`
`,
      }));

    });

    describe.skip('custom options', () => {

      it('root filename', testCmd({
        input: ['tree', '-r', 'custom-bonsai'],
        cmd: ['tree'],
        args: {},
        opts: {
          root: 'custom-bonsai',
          glob: './custom-index/*',
        },
        output:
`
`,
      }));

      it('base; custom; option; index files glob', testCmd({
        input: ['tree', '-g', './custom-index/*'],
        cmd: ['tree'],
        args: {},
        opts: {
          root: 'custom-bonsai',
          glob: './custom-index/*',
        },
        output:
`
`,
      }));

    });

    describe.skip('error', () => {

      it('no root', testCmd({
        input: ['tree', '-r', 'no-root'],
        cmd: ['tree'],
        args: {},
        opts: {
          root: 'no-root',
        },
        output:
`
`,
      }));

      it('no index files', testCmd({
        input: ['tree', '-g', './custom-index/*'],
        cmd: ['tree'],
        args: {},
        opts: {
          glob: './custom-index/*',
        },
        output:
`
`,
      }));

      it('tree did not build; duplicates found', testCmd({
        input: ['tree'],
        cmd: ['tree'],
        args: {},
        opts: {},
        output:
`
`,
      }));

    });

  });

});