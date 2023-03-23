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

const testCmdRetype = (test: CommandTestCase) => () => {
  // go //
  const argv: yargs.Argv = tendr(test.input, 'test');
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

describe('retype', () => {

  beforeEach(() => {
    const fnameA: string = `
:old-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`;
    const fnameB: string = `
:old-attrtype::[[fname-a]]
`;
    const fnameC: string = `
:old-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`;
    const fnameD: string = `
[[fname-a]]
`;
    const fnameE: string = `
[[no-doc]]
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

  it('base; equivalent to ref', testCmdRetype({
    input: ['retype', 'old-reftype', 'new-reftype'],
    cmd: ['retype'],
    args: {
      ['old-type']: 'old-reftype',
      ['new-type']: 'new-reftype',
    },
    opts: {},
    output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-a
  fname-c`,
    contents: {
      'fname-a': `
:new-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
      'fname-b': `
:old-attrtype::[[fname-a]]
`,
      'fname-c': `
:new-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
      'fname-d': `
[[fname-a]]
`,
      'fname-e': `
[[no-doc]]
`,
    },
  }));

  describe('kind', () => {

    it('ref; attr + link', testCmdRetype({
      input: ['retype', 'old-reftype', 'new-reftype', '-k', 'reftype'],
      cmd: ['retype'],
      args: {
        ['old-type']: 'old-reftype',
        ['new-type']: 'new-reftype',
      },
      opts: { kind: 'reftype' },
      output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-a
  fname-c`,
      contents: {
        'fname-a': `
:new-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
        'fname-b': `
:old-attrtype::[[fname-a]]
`,
        'fname-c': `
:new-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
        'fname-d': `
[[fname-a]]
`,
        'fname-e': `
[[no-doc]]
`,
      },
    }));

    it('attr', testCmdRetype({
      input: ['retype', 'old-attrtype', 'new-attrtype', '-k', 'attrtype'],
      cmd: ['retype'],
      args: {
        ['old-type']: 'old-attrtype',
        ['new-type']: 'new-attrtype',
      },
      opts: { kind: 'attrtype' },
      output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-a
  fname-b`,
      contents: {
        'fname-a':
`
:old-reftype::[[fname-b]]
:new-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
        'fname-b': `
:new-attrtype::[[fname-a]]
`,
        'fname-c': `
:old-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
        'fname-d': `
[[fname-a]]
`,
        'fname-e': `
[[no-doc]]
`,
      },
    }));

    it('link', testCmdRetype({
      input: ['retype', 'old-linktype', 'new-linktype', '-k', 'linktype'],
      cmd: ['retype'],
      args: {
        ['old-type']: 'old-linktype',
        ['new-type']: 'new-linktype',
      },
      opts: { kind: 'linktype' },
      output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-a
  fname-c`,
      contents: {
        'fname-a':
`
:old-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:new-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
        'fname-b': `
:old-attrtype::[[fname-a]]
`,
        'fname-c': `
:old-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:new-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
        'fname-d': `
[[fname-a]]
`,
        'fname-e': `
[[no-doc]]
`,
      },
    }));

  });

  it('none to update', testCmdRetype({
    input: ['retype', 'no-type', 'new-no-type'],
    cmd: ['retype'],
    args: {
      ['old-type']: 'no-type',
      ['new-type']: 'new-no-type',
    },
    opts: {},
    output:
`\x1B[32mUPDATED FILES:\x1B[39m
\x1B[2m  none\x1B[22m`,
    contents: {
      'fname-a':
`
:old-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
      'fname-b': `
:old-attrtype::[[fname-a]]
`,
      'fname-c': `
:old-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
      'fname-d': `
[[fname-a]]
`,
      'fname-e': `
[[no-doc]]
`,
    },
  }));

  describe('error', () => {

    it.skip('problem with fs.writeFileSync() of file to update', () => { return ;});

  });

});
