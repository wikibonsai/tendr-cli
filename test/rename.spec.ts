import assert from 'node:assert/strict';
import sinon from 'sinon';

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';

import { tendr } from '../src/tendr';
import { MD } from '../src/util/const';
import { CommandTestCase } from './types';


const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');
let fakeConsoleLog: any;
// for some reason eslint can't see the use of this var as a sinon spy
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let fakeProcessCwd: any;

const testCmdRename = (test: CommandTestCase) => () => {
  // go //
  const argv: yargs.Argv = tendr(test.input, 'test');
  // in
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
  if (!test.contents) { assert.fail(); }
  // file changes
  for (const fname of Object.keys(test.contents)) {
    const expdContent: string = test.contents[fname];
    const testFilePath: string = path.join(testCwd, fname + MD);
    if (!fs.existsSync(testFilePath)) {
      console.error(`could not find file at: ${testFilePath}`);
      assert.fail();
    }
    const actlContent: string = fs.readFileSync(testFilePath, 'utf8');
    assert.strictEqual(expdContent, actlContent);
  }
};

describe('rename', () => {

  beforeEach(() => {
    const fnameA: string = `
:reftype::[[fname-b]]
:attrtype::[[fname-c]]

:linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`;
    const fnameB: string = `
:attrtype::[[fname-a]]
`;
    const fnameC: string = `
:reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`;
    const fnameD: string = `
[[fname-a]]
`;
    const fnameE: string = `
[[fname-a|label]]
`;
    const fnameF: string = `
[[no-doc]]
`;
    const fnameG: string = `
![[fname-a]]
`;
    // populate test files
    if (!fs.existsSync(testCwd)) {
      // populate test files
      fs.mkdirSync(testCwd);
    }
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
  });

  afterEach(() => {
    fs.rmSync(testCwd, { recursive: true });
    fakeConsoleLog.restore();
  });

  it('base; file + all refs', testCmdRename({
    input: ['rename', 'fname-a', 'new-name'],
    cmd: ['rename'],
    args: {
      ['old-fname']: 'fname-a',
      ['new-fname']: 'new-name',
    },
    output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
    contents: {
      'new-name':
`
:reftype::[[fname-b]]
:attrtype::[[fname-c]]

:linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
      'fname-b': `
:attrtype::[[new-name]]
`,
      'fname-c': `
:reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:linktype::[[new-name]] and some text to illustrate that this is a typed wikilink!
`,
      'fname-d': `
[[new-name]]
`,
      'fname-e': `
[[new-name|label]]
`,
      'fname-f': `
[[no-doc]]
`,
      'fname-g': `
![[new-name]]
`,
    },
  }));

  describe('error', () => {

    it.skip('problem with fs.writeFileSync() of file to update', () => { return ;});

  });

});
