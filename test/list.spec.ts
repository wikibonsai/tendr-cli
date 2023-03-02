import assert from 'node:assert/strict';
import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import { tendr } from '../src/lib/tendr';
import { CommandTestCase } from './types';



const commandName: string = 'list';
const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');
let fakeConsoleLog: any;
let fakeConsoleError: any;
let fakeProcessCwd: any;

const testCmd = (test: CommandTestCase) => () => {
  tendr.parse(test.cmd);
  // in
  assert.deepStrictEqual(tendr.args, test.args);
  const cmd: any = tendr.commands.find((cmd) => cmd.name() === commandName);
  assert.deepStrictEqual(cmd.opts(), test.opts ? test.opts : {});
  // out
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
    // clear opts of tendr program
    const cmd: any = tendr.commands.find((cmd) => cmd.name() === commandName);
    cmd._optionValues = {};
  });

  it('base; all refs', testCmd({
    cmd: ['node', 'tendr', 'list', 'fname-a'],
    args: ['list', 'fname-a'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'ref'],
      args: ['list', 'fname-a', '-k', 'ref'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'attr'],
      args: ['list', 'fname-a', '-k', 'attr'],
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
      cmd: ['node', 'tendr', 'list', 'fname-g'],
      args: ['list', 'fname-g'],
      output: 
`\x1B[33mFILE: \x1B[39mfname-g
\x1B[34mFORE\x1B[39m
\x1B[32m  ATTRS\x1B[39m
\x1B[2m      one\x1B[22m
\x1B[2m      two\x1B[22m
\x1B[2m      three\x1B[22m
\x1B[2m      four\x1B[22m
\x1B[32m  LINKS\x1B[39m
\x1B[2m      no wikilinks\x1B[22m
\x1B[32m  EMBEDS\x1B[39m
\x1B[2m      no wikiembeds\x1B[22m
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
\x1B[2m      no wikiattrs\x1B[22m
\x1B[32m  LINKS\x1B[39m
\x1B[2m      no wikilinks\x1B[22m
\x1B[32m  EMBEDS\x1B[39m
\x1B[2m      no wikiembeds\x1B[22m`,
    }));

    it('links', testCmd({
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'link'],
      args: ['list', 'fname-a', '-k', 'link'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'fore'],
      args: ['list', 'fname-a', '-k', 'fore'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'foreref'],
      args: ['list', 'fname-a', '-k', 'foreref'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'foreattr'],
      args: ['list', 'fname-a', '-k', 'foreattr'],
      opts: { kind: 'foreattr' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mFORE\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b
      fname-c`,
    }));

    it('forelinks', testCmd({
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'forelink'],
      args: ['list', 'fname-a', '-k', 'forelink'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'foreembed'],
      args: ['list', 'fname-a', '-k', 'foreembed'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'back'],
      args: ['list', 'fname-a', '-k', 'back'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'backref'],
      args: ['list', 'fname-a', '-k', 'backref'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'backattr'],
      args: ['list', 'fname-a', '-k', 'backattr'],
      opts: { kind: 'backattr' },
      output:
`\x1B[33mFILE: \x1B[39mfname-a
\x1B[34mBACK\x1B[39m
\x1B[32m  ATTRS\x1B[39m
      fname-b`,
    }));

    it('backlinks', testCmd({
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'backlink'],
      args: ['list', 'fname-a', '-k', 'backlink'],
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
      cmd: ['node', 'tendr', 'list', 'fname-a', '-k', 'backembed'],
      args: ['list', 'fname-a', '-k', 'backembed'],
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
      cmd: ['node', 'tendr', 'list', 'no-doc'],
      args: ['list', 'no-doc'],
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
      cmd: ['node', 'tendr', 'list', 'no-doc-no-refs'],
      args: ['list', 'no-doc-no-refs'],
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
      cmd: ['node', 'tendr', 'list', ''],
      args: ['list', ''],
      opts: {},
      output: '',
    }));

    it('problem with wikirefs.scan(); attr', testCmd({
      cmd: ['node', 'tendr', 'list', ''],
      args: ['list', ''],
      opts: {},
      output: '',
    }));

    it('problem with wikirefs.scan(); link', testCmd({
      cmd: ['node', 'tendr', 'list', ''],
      args: ['list', ''],
      opts: {},
      output: '',
    }));

  });

});
