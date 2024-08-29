import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import type { TestMocks } from './types';
import { runCmdTestSync } from './runner';


const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');
let fakeConsoleLog: any;
let fakeConsoleWarn: any;
let fakeConsoleError: any;
let fakeProcessCwd: any;

const SHOW_RESULT: boolean = true;

const mocks: TestMocks = {
  fakeProcessCwd,
  fakeConsoleLog,
  fakeConsoleWarn,
  fakeConsoleError,
  testCwd,
};

describe('lint', () => {

  beforeEach(() => {
    const config: string = '[garden]\n'
                         + 'root    = \'i.bonsai\'\n';
    const doctypes: string = '[index]\n'
                           + 'path   = "/index/"\n'
                           + 'prefix = "i."\n';
    const bonsai: string = '- [[fname-a]]\n'
                         + '  - [[fname-b]]\n'
                         + '    - [[fname-c]]\n';
    const fnameA: string = '';
    const fnameB: string = '';
    const fnameC: string = '';
    // populate test files
    if (!fs.existsSync(testCwd)) {
      fs.mkdirSync(testCwd);
    }
    fs.writeFileSync('config.toml', config);
    fs.writeFileSync('t.doc.toml', doctypes);
    fs.writeFileSync(path.join(testCwd, 'i.bonsai.md'), bonsai);
    if (!fs.existsSync(path.join(testCwd, 'fname-a.md'))) {
      fs.writeFileSync(path.join(testCwd, 'fname-a.md'), fnameA);
    }
    fs.writeFileSync(path.join(testCwd, 'fname-b.md'), fnameB);
    fs.writeFileSync(path.join(testCwd, 'fname-c.md'), fnameC);
    // fake "current working directory"
    process.cwd = () => testCwd;
    mocks.fakeProcessCwd = sinon.spy(process, 'cwd');
    // suppress console
    console.log = (msg) => msg + '\n';
    console.warn = (msg) => msg + '\n';
    console.error = (msg) => msg + '\n';
    // fake console
    mocks.fakeConsoleLog = sinon.spy(console, 'log');
    mocks.fakeConsoleWarn = sinon.spy(console, 'warn');
    mocks.fakeConsoleError = sinon.spy(console, 'error');
  });

  afterEach(() => {
    if (fs.existsSync(testCwd)) {
      fs.rmSync(testCwd, { recursive: true });
    }
    if (fs.existsSync('config.toml')) {
      fs.rmSync('config.toml');
    }
    if (fs.existsSync('t.doc.toml')) {
      fs.rmSync('t.doc.toml');
    }
    mocks.fakeConsoleLog.restore();
    mocks.fakeConsoleWarn.restore();
    mocks.fakeConsoleError.restore();
    mocks.fakeProcessCwd.restore();
  });

  describe('single index file', () => {

    it('success', runCmdTestSync(mocks, {
      input: ['lint'],
      cmd: ['lint'],
      args: {},
      opts: {},
      output:
        '\x1B[32m✅ all clean\x1B[39m',
    }));

    describe('error; duplicates', () => {

      beforeEach(() => {
        // append duplicate wikilink to root file
        fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '- [[fname-a]]\n');
      });

      it('found', runCmdTestSync(mocks, {
        input: ['lint'],
        cmd: ['lint'],
        args: {},
        opts: {},
        output:
          '\x1B[31m❌ lint errors:\x1B[39m\n'
        + '\x1B[31m\x1B[39m\n'
        + '\x1B[31msemtree.lint(): duplicate entity names found:\x1B[39m\n'
        + '\x1B[31m\x1B[39m\n'
        + '\x1B[31m- "fname-a"\x1B[39m\n'
        + '\x1B[31m  - File "i.bonsai" Line 1\x1B[39m\n'
        + '\x1B[31m  - File "i.bonsai" Line 4\x1B[39m\n'
        + '\x1B[31m\x1B[39m'
      }));

    });

    describe('error; improper indentation', () => {

      beforeEach(() => {
        // append duplicate wikilink to root file
        fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), ' - [[indent-error]]\n');
      });

      it('found', runCmdTestSync(mocks, {
        input: ['lint'],
        cmd: ['lint'],
        args: {},
        opts: {},
        output:
          '\x1B[31m❌ lint errors:\x1B[39m\n'
        + '\x1B[31m\x1B[39m\n'
        + '\x1B[31msemtree.lint(): improper indentation found:\x1B[39m\n'
        + '\x1B[31m\x1B[39m\n'
        + '\x1B[31m- File "i.bonsai" Line 4 (inconsistent indentation): " - [[indent-error]]"\x1B[39m\n'
        + '\x1B[31m\x1B[39m'
      }));

    });

    describe('warn; orphan trunk files', () => {

      beforeEach(() => {
        // add unlinked trunk file
        fs.writeFileSync(path.join(testCwd, 'i.trunk-1.md'), '- [[fname-1]]\n');
        fs.writeFileSync(path.join(testCwd, 'i.trunk-2.md'), '- [[fname-2]]\n');
      });

      it('found', runCmdTestSync(mocks, {
        input: ['lint'],
        cmd: ['lint'],
        args: {},
        opts: {},
        output:
          '\x1B[33m⚠️ lint warnings:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33msemtree.lint(): orphan trunk files found:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33m- i.trunk-1\x1B[39m\n'
        + '\x1B[33m- i.trunk-2\x1B[39m\n'
        + '\x1B[33m\x1B[39m',
      }));

    });

    describe('warn; markdown bullets missing', () => {

      beforeEach(() => {
        // append duplicate wikilink to root file
        fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '[[no-mkdn-bullet]]\n');
      });

      it('found', runCmdTestSync(mocks, {
        input: ['lint'],
        cmd: ['lint'],
        args: {},
        opts: {},
        output:
          '\x1B[33m⚠️ lint warnings:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33msemtree.lint(): missing markdown bullet found:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33m- File "i.bonsai" Line 4: "[[no-mkdn-bullet]]"\x1B[39m\n'
        + '\x1B[33m\x1B[39m'
      }));

    });

    describe('warn; wikilinks missing', () => {

      beforeEach(() => {
        // append duplicate wikilink to root file
        fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '- no-wikilinks\n');
      });

      it('found', runCmdTestSync(mocks, {
        input: ['lint'],
        cmd: ['lint'],
        args: {},
        opts: {},
        output:
          '\x1B[33m⚠️ lint warnings:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33msemtree.lint(): missing wikilink found:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33m- File "i.bonsai" Line 4: "- no-wikilinks"\x1B[39m\n'
        + '\x1B[33m\x1B[39m'
      }));

    });

  });

  describe.skip('multi index file', () => {

    beforeEach(() => {
      const branch: string = '';
      // populate test files
      if (!fs.existsSync(testCwd)) {
        fs.mkdirSync(testCwd);
      }
      fs.writeFileSync(path.join(testCwd, 'i.branch.md'), branch);
      // append reference to root file
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '  - [[i.branch]]\n');
    });

    it('success', runCmdTestSync(mocks, {
      input: ['lint'],
      cmd: ['lint'],
      args: {},
      opts: {},
      output:
        '\n',
    }, SHOW_RESULT));

  });

});
