import assert from 'node:assert/strict';
import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import { tendr } from '../src/lib/tendr';
import { MD } from '../src/lib/const';
import { CommandTestCase } from './types';


const commandName: string = 'retype';
const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');
let fakeConsoleLog: any;
// for some reason eslint can't see the use of this var as a sinon spy
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let fakeProcessCwd: any;

const testCmdRetype = (test: CommandTestCase) => () => {
  tendr.parse(test.cmd);
  // in
  assert.deepStrictEqual(tendr.args, test.args);
  const cmd: any = tendr.commands.find((cmd) => cmd.name() === commandName);
  assert.deepStrictEqual(cmd.opts(), test.opts ? test.opts : {});
  // out
  assert.strictEqual(fakeConsoleLog.called, true);
  assert.strictEqual(fakeConsoleLog.getCall(0).args[0], test.output);
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
    // clear opts of tendr program
    const cmd: any = tendr.commands.find((cmd) => cmd.name() === commandName);
    cmd._optionValues = {};
  });

  it('base; equivalent to ref', testCmdRetype({
    cmd: ['node', 'tendr', 'retype', 'old-reftype', 'new-reftype'],
    args: ['retype', 'old-reftype', 'new-reftype'],
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
      cmd: ['node', 'tendr', 'retype', 'old-reftype', 'new-reftype', '-k', 'reftype'],
      args: ['retype', 'old-reftype', 'new-reftype', '-k', 'reftype'],
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
      cmd: ['node', 'tendr', 'retype', 'old-attrtype', 'new-attrtype', '-k', 'attrtype'],
      args: ['retype', 'old-attrtype', 'new-attrtype', '-k', 'attrtype'],
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
      cmd: ['node', 'tendr', 'retype', 'old-linktype', 'new-linktype', '-k', 'linktype'],
      args: ['retype', 'old-linktype', 'new-linktype', '-k', 'linktype'],
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
    cmd: ['node', 'tendr', 'retype', 'no-type', 'new-no-type'],
    args: ['retype', 'no-type', 'new-no-type'],
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
