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

describe('doctor', () => {

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
    if (fs.existsSync('t.rel.toml')) {
      fs.rmSync('t.rel.toml');
    }
    mocks.fakeConsoleLog.restore();
    mocks.fakeConsoleWarn.restore();
    mocks.fakeConsoleError.restore();
    mocks.fakeProcessCwd.restore();
  });

  describe('config', () => {

    it('error; invalid format value', () => {
      const config: string = '[garden]\n'
                           + 'root = \'i.bonsai\'\n'
                           + '\n'
                           + '[format]\n'
                           + 'case_title = \'INVALID\'\n';
      fs.writeFileSync('config.toml', config);
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\x1B[31m❌ [config] case_title "INVALID" must be one of: Title Case, lower case, kabob-case, snake_case\x1B[39m',
      })();
    });

    it('warn; deprecated [lint] key', () => {
      const config: string = '[garden]\n'
                           + 'root = \'i.bonsai\'\n'
                           + '\n'
                           + '[lint]\n'
                           + 'indent_kind = \'space\'\n';
      fs.writeFileSync('config.toml', config);
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        warn: 'trug: found [lint] in config \u2014 please rename to [format]',
        output:
          '\x1B[33m\u26A0\uFE0F [config] [lint] is deprecated \u2014 rename to [format]\x1B[39m',
      })();
    });

  });

  describe('types', () => {

    it('error; broken sync pair', () => {
      const reltypes: string = '[[types]]\n'
                             + 'name = "hypernym"\n'
                             + 'kind = "attr"\n'
                             + 'sync = "nonexistent"\n';
      fs.writeFileSync('t.rel.toml', reltypes);
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\x1B[31m❌ [types] "hypernym" syncs to "nonexistent" but "nonexistent" does not exist in types\x1B[39m',
      })();
    });

    it('warn; orphan named section', () => {
      const reltypes: string = '[[types]]\n'
                             + 'name = "hypernym"\n'
                             + 'kind = "attr"\n'
                             + '\n'
                             + '[stale-section]\n'
                             + 'color = "red"\n';
      fs.writeFileSync('t.rel.toml', reltypes);
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\x1B[33m\u26A0\uFE0F [types] Named section [stale-section] does not match any type in the types array\x1B[39m',
      })();
    });

  });

  describe('semtree', () => {

    it('success; all clean', runCmdTestSync(mocks, {
      input: ['doctor'],
      cmd: ['doctor'],
      args: {},
      opts: {},
      output:
        '\x1B[32m✅ all clean\x1B[39m',
    }));

    it('success; with delimiters', () => {
      const filePath: string = path.join(testCwd, 'i.bonsai.md');
      const existingContent: string = fs.readFileSync(filePath, 'utf-8');
      const newContent: string = '---\n'
                               + 'yaml-attr: some-value\n'
                               + '---\n'
                               + ': caml-attr :: some-value\n'
                               + '<!--semtree-->\n'
                               + existingContent
                               + '<!--/semtree-->\n';
      fs.writeFileSync(filePath, newContent);
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\x1B[32m✅ all clean\x1B[39m',
      })();
    });

    it('success; strip caml', () => {
      const filePath: string = path.join(testCwd, 'i.bonsai.md');
      const existingContent: string = fs.readFileSync(filePath, 'utf-8');
      const newContent: string = ': caml-attr :: some-value\n' + existingContent;
      fs.writeFileSync(filePath, newContent);
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\x1B[32m✅ all clean\x1B[39m',
      })();
    });

    it('success; strip yaml', () => {
      const filePath: string = path.join(testCwd, 'i.bonsai.md');
      const existingContent: string = fs.readFileSync(filePath, 'utf-8');
      const newContent: string = '---\n'
                               + 'yaml-attr: some-value\n'
                               + '---\n'
                               + existingContent;
      fs.writeFileSync(filePath, newContent);
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\x1B[32m✅ all clean\x1B[39m',
      })();
    });

    it('error; duplicates', () => {
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '- [[fname-a]]\n');
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
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
      })();
    });

    it('error; improper indentation', () => {
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), ' - [[indent-error]]\n');
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\x1B[31m❌ lint errors:\x1B[39m\n'
        + '\x1B[31m\x1B[39m\n'
        + '\x1B[31msemtree.lint(): improper indentation found:\x1B[39m\n'
        + '\x1B[31m\x1B[39m\n'
        + '\x1B[31m- File "i.bonsai" Line 4 (inconsistent indentation): " - [[indent-error]]"\x1B[39m\n'
        + '\x1B[31m\x1B[39m'
      })();
    });

    it('warn; orphan trunk files', () => {
      fs.writeFileSync(path.join(testCwd, 'i.trunk-1.md'), '- [[fname-1]]\n');
      fs.writeFileSync(path.join(testCwd, 'i.trunk-2.md'), '- [[fname-2]]\n');
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
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
      })();
    });

    it('warn; markdown bullets missing', () => {
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '[[no-mkdn-bullet]]\n');
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\x1B[33m⚠️ lint warnings:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33msemtree.lint(): missing markdown bullet found:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33m- File "i.bonsai" Line 4: "[[no-mkdn-bullet]]"\x1B[39m\n'
        + '\x1B[33m\x1B[39m'
      })();
    });

    it('warn; wikilinks missing', () => {
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '- no-wikilinks\n');
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\x1B[33m⚠️ lint warnings:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33msemtree.lint(): missing wikilink found:\x1B[39m\n'
        + '\x1B[33m\x1B[39m\n'
        + '\x1B[33m- File "i.bonsai" Line 4: "- no-wikilinks"\x1B[39m\n'
        + '\x1B[33m\x1B[39m'
      })();
    });

  });

  describe.skip('multi index file', () => {

    it('success', () => {
      const branch: string = '';
      if (!fs.existsSync(testCwd)) {
        fs.mkdirSync(testCwd);
      }
      fs.writeFileSync(path.join(testCwd, 'i.branch.md'), branch);
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '  - [[i.branch]]\n');
      runCmdTestSync(mocks, {
        input: ['doctor'],
        cmd: ['doctor'],
        args: {},
        opts: {},
        output:
          '\n',
      }, SHOW_RESULT)();
    });

  });

});
