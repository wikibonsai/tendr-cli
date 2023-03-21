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

describe('list', () => {

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
[[no-doc]]
`;
    const fnameF: string = `
![[fname-a]]
`;
    const fnameG: string = `
:type-1::[[one]],[[two]]
:type-2::
- [[three]]
- [[four]]
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
    fakeConsoleError = sinon.spy(console, 'error');
  });

  afterEach(() => {
    fs.rmSync(testCwd, { recursive: true });
    fakeConsoleLog.restore();
    fakeConsoleError.restore();
    fakeProcessCwd.restore();
  });

  it('base; all refs', testCmd({
    // input: ['node', 'tendr', 'list', 'fname-a'],
    input: ['list', 'fname-a'],
    cmd: ['list'],
    args: { filename: 'fname-a' },
    opts: { kind: 'ref' },
    output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
      fname-c
\x1B[32m  LINKS\x1B[39m
      fname-d
      fname-e
\x1B[2m      no-doc\x1B[22m
\x1B[32m  EMBEDS\x1B[39m
\x1B[2m      no wikiembeds\x1B[22m
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
\x1B[32m  LINKS\x1B[39m
      fname-b
      fname-c
      fname-d
\x1B[32m  EMBEDS\x1B[39m
      fname-f`,
  }));

  describe('kind', () => {

    it('refs; attrs + links', testCmd({
      input: ['list', 'fname-a', '-k', 'ref'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'ref' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
      fname-c
\x1B[32m  LINKS\x1B[39m
      fname-d
      fname-e
\x1B[2m      no-doc\x1B[22m
\x1B[32m  EMBEDS\x1B[39m
\x1B[2m      no wikiembeds\x1B[22m
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
\x1B[32m  LINKS\x1B[39m
      fname-b
      fname-c
      fname-d
\x1B[32m  EMBEDS\x1B[39m
      fname-f`,
    }));

    it('attrs', testCmd({
      input: ['list', 'fname-a', '-k', 'attr'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'attr' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
      fname-c
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b`,
    }));

    it('attrs; list', testCmd({
      input: ['list', 'fname-g', '-k', 'attr'],
      cmd: ['list'],
      args: { filename: 'fname-g' },
      opts: { kind: 'attr' },
      output: 
`\x1B[33mFILE: \x1B[39mfname-g
\x1B[34mFORE\x1B[39m
\x1B[32m  ATTRS\x1B[39m
\x1B[2m      one\x1B[22m
\x1B[2m      two\x1B[22m
\x1B[2m      three\x1B[22m
\x1B[2m      four\x1B[22m
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
\x1B[2m      no wikiattrs\x1B[22m`,
    }));

    it('links', testCmd({
      // cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'link'],
      input: ['list', 'fname-a', '-k', 'link'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'link' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  LINKS\x1B[39m
      fname-d
      fname-e
\x1B[2m      no-doc\x1B[22m
\x1B[34mBACK\x1B[39m
\x1B[32m  LINKS\x1B[39m
      fname-b
      fname-c
      fname-d`,
    }));

  });

  describe('fore', () => {

    it('fore; equivalent to forerefs', testCmd({
      input: ['list', 'fname-a', '-k', 'fore'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'fore' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
      fname-c
\x1B[32m  LINKS\x1B[39m
      fname-d
      fname-e
\x1B[2m      no-doc\x1B[22m
\x1B[32m  EMBEDS\x1B[39m
\x1B[2m      no wikiembeds\x1B[22m`,
    }));

    it('forerefs; equivalent to fore', testCmd({
      input: ['list', 'fname-a', '-k', 'foreref'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'foreref' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
      fname-c
\x1B[32m  LINKS\x1B[39m
      fname-d
      fname-e
\x1B[2m      no-doc\x1B[22m
\x1B[32m  EMBEDS\x1B[39m
\x1B[2m      no wikiembeds\x1B[22m`,
    }));

    it('foreattrs', testCmd({
      input: ['list', 'fname-a', '-k', 'foreattr'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'foreattr' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
      fname-c`,
    }));

    it('forelinks', testCmd({
      input: ['list', 'fname-a', '-k', 'forelink'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'forelink' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  LINKS\x1B[39m
      fname-d
      fname-e
\x1B[2m      no-doc\x1B[22m`,
    }));

    it('foreembeds', testCmd({
      input: ['list', 'fname-a', '-k', 'foreembed'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'foreembed' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  EMBEDS\x1B[39m
\x1B[2m      no wikiembeds\x1B[22m`,
    }));

  });

  describe('back', () => {

    it('back; equivalent to backrefs', testCmd({
      input: ['list', 'fname-a', '-k', 'back'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'back' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
\x1B[32m  LINKS\x1B[39m
      fname-b
      fname-c
      fname-d
\x1B[32m  EMBEDS\x1B[39m
      fname-f`,
    }));

    it('backrefs; equivalent to back', testCmd({
      input: ['list', 'fname-a', '-k', 'backref'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'backref' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
\x1B[32m  LINKS\x1B[39m
      fname-b
      fname-c
      fname-d
\x1B[32m  EMBEDS\x1B[39m
      fname-f`,
    }));

    it('backattrs', testCmd({
      input: ['list', 'fname-a', '-k', 'backattr'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'backattr' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b`,
    }));

    it('backlinks', testCmd({
      input: ['list', 'fname-a', '-k', 'backlink'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'backlink' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mBACK\x1B[39m
\x1B[32m  LINKS\x1B[39m
      fname-b
      fname-c
      fname-d`,
    }));

    it('backembeds', testCmd({
      input: ['list', 'fname-a', '-k', 'backembed'],
      cmd: ['list'],
      args: { filename: 'fname-a' },
      opts: { kind: 'backembed' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mBACK\x1B[39m
\x1B[32m  EMBEDS\x1B[39m
      fname-f`,
    }));

  });

  describe('zombie', () => {

    it('zombie (target file does not exist); refs exist', testCmd({
      input: ['list', 'no-doc'],
      cmd: ['list'],
      args: { filename: 'no-doc' },
      opts: {},
      output:
`\x1B[31mNO FILE FOR: \x1B[39m\x1B[2mno-doc\x1B[22m
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
\x1B[2m      no wikiattrs\x1B[22m
\x1B[32m  LINKS\x1B[39m
      fname-a
      fname-e
\x1B[32m  EMBEDS\x1B[39m
\x1B[2m      no wikiembeds\x1B[22m`,
    }));

    it('zombie (target file does not exist); refs do not exist', testCmd({
      input: ['list', 'no-doc-no-refs'],
      cmd: ['list'],
      args: { filename: 'no-doc-no-refs' },
      opts: {},
      output:
`\x1B[31mNO FILE FOR: \x1B[39m\x1B[2mno-doc-no-refs\x1B[22m
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
\x1B[2m      no wikiattrs\x1B[22m
\x1B[32m  LINKS\x1B[39m
\x1B[2m      no wikilinks\x1B[22m
\x1B[32m  EMBEDS\x1B[39m
\x1B[2m      no wikiembeds\x1B[22m`,
    }));

  });

  describe.skip('error', () => {

    it('problem with fs.readFileSync() of target file', testCmd({
      input: ['list', ''],
      cmd: ['list'],
      args: { filename: '' },
      opts: {},
      output: '',
    }));

    it('problem with wikirefs.scan(); attr', testCmd({
      input: ['list', ''],
      cmd: ['list'],
      args: { filename: '' },
      output: '',
    }));

    it('problem with wikirefs.scan(); link', testCmd({
      input: ['list', ''],
      cmd: ['list'],
      args: { filename: '' },
      output: '',
    }));

  });

});
