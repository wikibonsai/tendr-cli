import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import type { TestMocks } from './types';
import { runCmdTest } from './runner';


let fakeProcessCwd: any;
let fakeConsoleLog: any;
let fakeConsoleError: any;
const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');

const SHOW_RESULT: boolean = true;

const mocks: TestMocks = {
  fakeProcessCwd,
  fakeConsoleLog,
  fakeConsoleError,
  testCwd,
};

describe('status', () => {

  beforeEach(() => {
    const config: string = 
      '[garden]\n'
      + 'root    = \'i.bonsai\'\n';
    const doctypes: string = 
      '\n[default]\n'
      + 'path   = "/"\n';
    const bonsai: string = 
      '- [[fname-a]]\n'
      + '  - [[fname-b]]\n'
      + '    - [[fname-f]]\n'
      + '  - [[fname-c]]\n'
      + '    - [[fname-g]]\n'
      + '    - [[fname-h]]\n'
      + '    - [[fname-i]]\n'
      + '  - [[fname-d]]\n'
      + '  - [[fname-e]]\n';
    const fnameA: string =
      '\n'
      + ':reftype::[[fname-b]]\n'
      + ':attrtype::[[fname-c]]\n'
      + '\n'
      + ':linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!\n'
      + '\n'
      + '[[fname-e]]\n'
      + '\n'
      + '[[no-doc]]\n'
      + '';
    const fnameB: string =
      '\n'
      + ':attrtype::[[fname-a]]\n'
      + '';
    const fnameC: string =
      '\n'
      + ':reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!\n'
      + ':linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!\n'
      + '';
    const fnameD: string =
      '\n'
      + '[[fname-a]]\n'
      + '';
    const fnameE: string =
      '\n'
      + '[[no-doc]]\n'
      + '';
    const fnameF: string =
      '\n'
      + '![[fname-a]]\n'
      + '';
    const fnameG: string =
      '\n'
      + ':type-1::[[one]],[[two]]\n'
      + ':type-2::\n'
      + '- [[three]]\n'
      + '- [[four]]\n'
      + '';
    // populate test files
    if (!fs.existsSync(testCwd)) {
      // populate test files
      fs.mkdirSync(testCwd);
    }
    // make index dir
    if (!fs.existsSync(path.join(testCwd, 'index'))) {
      fs.mkdirSync(path.join(testCwd, 'index'));
    }
    fs.writeFileSync('config.toml', config);
    fs.writeFileSync('t.doc.toml', doctypes);
    fs.writeFileSync(path.join(testCwd, 'index', 'i.bonsai.md'), bonsai);
    fs.writeFileSync(path.join(testCwd, 'fname-a.md'), fnameA);
    fs.writeFileSync(path.join(testCwd, 'fname-b.md'), fnameB);
    fs.writeFileSync(path.join(testCwd, 'fname-c.md'), fnameC);
    fs.writeFileSync(path.join(testCwd, 'fname-d.md'), fnameD);
    fs.writeFileSync(path.join(testCwd, 'fname-e.md'), fnameE);
    fs.writeFileSync(path.join(testCwd, 'fname-f.md'), fnameF);
    fs.writeFileSync(path.join(testCwd, 'fname-g.md'), fnameG);
    // fake "current working directory"
    process.cwd = () => testCwd;
    mocks.fakeProcessCwd = sinon.spy(process, 'cwd');
    // suppress console
    console.log = (msg) => msg + '\n';
    console.warn = (msg) => msg + '\n';
    console.error = (msg) => msg + '\n';
    // fake console.log
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

  it('base; all rels', runCmdTest(mocks, {
    input: ['status', 'fname-a'],
    cmd: ['status'],
    args: { filename: 'fname-a' },
    opts: { kind: 'rel' },
    output:
      '📄 fname-a [default]\n'
      + '\n'
      + '🌳 Tree\n'
      + '\n'
      + '  ancestors: i.bonsai\n'
      + '  children: fname-b, fname-c, fname-d, fname-e\n'
      + '\n'
      + '🕸️ Web\n'
      + '          back                    fore\n'
      + '  attr    ◦ attrtype              ◦ reftype\n'
      + '            • fname-b               • fname-b\n'
      + '                                  ◦ attrtype\n'
      + '                                    • fname-c\n'
      + '  link    • fname-c [linktype]    • fname-d [linktype]\n'
      + '          • fname-d               • fname-e\n'
      + '          • i.bonsai              • no-doc\n'
      + '  embed   • fname-f               --'
  }, SHOW_RESULT));

  describe('kind', () => {

    it('rel; all fam and ref rels; (default)', runCmdTest(mocks, {
      input: ['status', 'fname-a', '-k', 'rel'],
      cmd: ['status'],
      args: { filename: 'fname-a' },
      opts: { kind: 'rel' },
              output:
        '📄 fname-a [default]\n'
        + '\n'
        + '🌳 Tree\n'
        + '\n'
        + '  ancestors: i.bonsai\n'
        + '  children: fname-b, fname-c, fname-d, fname-e\n'
        + '\n'
        + '🕸️ Web\n'
        + '          back                    fore\n'
        + '  attr    ◦ attrtype              ◦ reftype\n'
        + '            • fname-b               • fname-b\n'
        + '                                  ◦ attrtype\n'
        + '                                    • fname-c\n'
        + '  link    • fname-c [linktype]    • fname-d [linktype]\n'
        + '          • fname-d               • fname-e\n'
        + '          • i.bonsai              • no-doc\n'
        + '  embed   • fname-f               --'
      }, SHOW_RESULT));

    it('ancestors', runCmdTest(mocks, {
      input: ['status', 'fname-a', '-k', 'ancestor'],
      cmd: ['status'],
      args: { filename: 'fname-a' },
      opts: { kind: 'ancestor' },
              output:
        '📄 fname-a [default]\n'
        + '\n'
        + '🌳 Tree\n'
        + '\n'
        + '  ancestors: i.bonsai\n'
        + '  children: --\n'
    }, SHOW_RESULT));

    it('attrs; list', runCmdTest(mocks, {
      input: ['status', 'fname-g', '-k', 'attr'],
      cmd: ['status'],
      args: { filename: 'fname-g' },
      opts: { kind: 'attr' },
              output:
        '📄 fname-g [default]\n'
        + '\n'
        + '🌳 Tree\n'
        + '\n'
        + '  ancestors: --\n'
        + '  children: --\n'
        + '\n'
        + '🕸️ Web\n'
        + '          back      fore\n'
        + '  attr    --        ◦ type-1\n'
        + '                      • one\n'
        + '                      • two\n'
        + '                    ◦ type-2\n'
        + '                      • three\n'
        + '                      • four'
    }, SHOW_RESULT));

  });

  describe('fore', () => {

    it('fore; equivalent to forerefs', runCmdTest(mocks, {
      input: ['status', 'fname-a', '-k', 'fore'],
      cmd: ['status'],
      args: { filename: 'fname-a' },
      opts: { kind: 'fore' },
              output:
        '📄 fname-a [default]\n'
        + '\n'
        + '🌳 Tree\n'
        + '\n'
        + '  ancestors: --\n'
        + '  children: --\n'
        + '\n'
        + '🕸️ Web\n'
        + '          back      fore\n'
        + '  attr    --        ◦ reftype\n'
        + '                      • fname-b\n'
        + '                    ◦ attrtype\n'
        + '                      • fname-c\n'
        + '  link    --        • fname-d [linktype]\n'
        + '                    • fname-e\n'
        + '                    • no-doc\n'
        + '  embed   --        --'
    }, SHOW_RESULT));

    it('forerefs; equivalent to fore', runCmdTest(mocks, {
      input: ['status', 'fname-a', '-k', 'foreref'],
      cmd: ['status'],
      args: { filename: 'fname-a' },
      opts: { kind: 'foreref' },
              output:
        '📄 fname-a [default]\n'
        + '\n'
        + '🌳 Tree\n'
        + '\n'
        + '  ancestors: --\n'
        + '  children: --\n'
        + '\n'
        + '🕸️ Web\n'
        + '          back      fore\n'
        + '  attr    --        ◦ reftype\n'
        + '                      • fname-b\n'
        + '                    ◦ attrtype\n'
        + '                      • fname-c\n'
        + '  link    --        • fname-d [linktype]\n'
        + '                    • fname-e\n'
        + '                    • no-doc\n'
        + '  embed   --        --'
      }, SHOW_RESULT));

  describe('back', () => {

    it('back; equivalent to backrefs', runCmdTest(mocks, {
      input: ['status', 'fname-a', '-k', 'back'],
      cmd: ['status'],
      args: { filename: 'fname-a' },
      opts: { kind: 'back' },
              output:
        '📄 fname-a [default]\n'
        + '\n'
        + '🌳 Tree\n'
        + '\n'
        + '  ancestors: --\n'
        + '  children: --\n'
        + '\n'
        + '🕸️ Web\n'
        + '          back                    fore\n'
        + '  attr    ◦ attrtype              --\n'
        + '            • fname-b             \n'
        + '  link    • fname-c [linktype]    --\n'
        + '          • fname-d               \n'
        + '          • i.bonsai              \n'
        + '  embed   • fname-f               --'
      }, SHOW_RESULT));

    it('backrefs; equivalent to back', runCmdTest(mocks, {
      input: ['status', 'fname-a', '-k', 'backref'],
      cmd: ['status'],
      args: { filename: 'fname-a' },
      opts: { kind: 'backref' },
              output:
        '📄 fname-a [default]\n'
        + '\n'
        + '🌳 Tree\n'
        + '\n'
        + '  ancestors: --\n'
        + '  children: --\n'
        + '\n'
        + '🕸️ Web\n'
        + '          back                    fore\n'
        + '  attr    ◦ attrtype              --\n'
        + '            • fname-b             \n'
        + '  link    • fname-c [linktype]    --\n'
        + '          • fname-d               \n'
        + '          • i.bonsai              \n'
        + '  embed   • fname-f               --'
      }, SHOW_RESULT));

    });

    describe('doctype', () => {

      describe('with placeholder', () => {

        beforeEach(() => {
          const doctypes: string =
            '\n'
            + '[event]\n'
            + 'prefix = "evt.:date"\n'
            + '';
          const eventFile: string = 'this event happened on February seventh, 2020.';
          fs.writeFileSync('t.doc.toml', doctypes);
          fs.writeFileSync(path.join(testCwd, 'evt.2020-02-07.md'), eventFile);
        });

        it('":date"', runCmdTest(mocks, {
          input: ['status', 'evt.2020-02-07'],
          cmd: ['status'],
          args: { filename: 'evt.2020-02-07' },
          opts: {},
                      output:
            '📄 evt.2020-02-07 [event]\n'
            + '\n'
            + '🌳 Tree\n'
            + '\n'
            + '  ancestors: --\n'
            + '  children: --\n'
            + '\n'
            + '🕸️ Web\n'
            + '          back      fore\n'
            + '  attr    --        --\n'
            + '  link    --        --\n'
            + '  embed   --        --'
          }, SHOW_RESULT));

      });

    });

  });

  describe.skip('error (do not execute)', () => {

    it('problem with fs.readFileSync() of target file', runCmdTest(mocks, {
        input: ['status', ''],
        cmd: ['status'],
        args: { filename: '' },
        opts: {},
        output: '',
      }));

    it('problem with wikirefs.scan(); attr', runCmdTest(mocks, {
        input: ['status', ''],
        cmd: ['status'],
        args: { filename: '' },
        output: '',
      }));

    it('problem with wikirefs.scan(); link', runCmdTest(mocks, {
        input: ['status', ''],
        cmd: ['status'],
        args: { filename: '' },
        output: '',
      }));

    it('problem with wikirefs.scan(); embed', runCmdTest(mocks, {
        input: ['status', ''],
        cmd: ['status'],
        args: { filename: '' },
        output: '',
      }));

  });

});
