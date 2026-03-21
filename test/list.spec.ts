import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import type { TestMocks } from './types';
import { runCmdTestSync } from './runner';

const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');

let fakeProcessCwd: any;
let fakeConsoleLog: any;

const mocks: TestMocks = {
  fakeProcessCwd,
  fakeConsoleLog,
  testCwd,
};

describe('list', () => {

  beforeEach(() => {
    // reset filesystem
    if (fs.existsSync(testCwd)) {
      fs.rmSync(testCwd, { recursive: true });
    }
    fs.mkdirSync(testCwd, { recursive: true });

    // required config/doctypes files (relative to process.cwd)
    const config: string = `[garden]\nroot    = 'i.bonsai'\n`;
    // note: the app reads these via relative paths like "./config.toml"
    // without calling process.chdir(), so they must exist in the real cwd.
    fs.writeFileSync('config.toml', config);

    // keep doctype file empty by default (tests can overwrite)
    fs.writeFileSync('t.doc.toml', '');

    // fake process.cwd
    process.cwd = () => testCwd;
    fakeProcessCwd = sinon.spy(process, 'cwd');
    mocks.fakeProcessCwd = fakeProcessCwd;

    // fake console.log
    console.log = (msg) => msg + '\n';
    fakeConsoleLog = sinon.spy(console, 'log');
    mocks.fakeConsoleLog = fakeConsoleLog;
  });

  afterEach(() => {
    mocks.fakeProcessCwd.restore();
    mocks.fakeConsoleLog.restore();

    if (fs.existsSync(testCwd)) {
      fs.rmSync(testCwd, { recursive: true });
    }
    if (fs.existsSync('config.toml')) {
      fs.rmSync('config.toml');
    }
    if (fs.existsSync('t.doc.toml')) {
      fs.rmSync('t.doc.toml');
    }
  });

  it('base counts', () => {
    // garden:
    // - semantic tree via index/i.bonsai.md
    // - a + b are referenced in tree
    // - orphan + isolate are unreferenced and contain no wikirefs
    fs.mkdirSync(path.join(testCwd, 'index'));
    fs.writeFileSync(path.join(testCwd, 'index', 'i.bonsai.md'), '- [[a]]\n- [[b]]\n', 'utf8');
    fs.writeFileSync(path.join(testCwd, 'a.md'), '::linktype::[[b]]\n', 'utf8');
    // Single ':' form is parsed as wikiattr by wikirefs.scan().
    fs.writeFileSync(path.join(testCwd, 'b.md'), ':attrtype::[[a]]\n', 'utf8');
    fs.writeFileSync(path.join(testCwd, 'orphan.md'), '', 'utf8');
    fs.writeFileSync(path.join(testCwd, 'isolate.md'), '', 'utf8');
    // doctype types count is keys in t.doc.toml; set 1 key here.
    fs.writeFileSync('t.doc.toml', '[default]\npath = \"/\"\n', 'utf8');

    return runCmdTestSync(mocks, {
      input: ['list'],
      cmd: ['list'],
      output:
        + 'structure\n'
        + '\n'
        + '  nodes              5\n'
        + '  tree               3\n'
        + '  web                3\n'
        + '  orphans            2\n'
        + '  isolates           2\n'
        + '\n'
        + 'references\n'
        + '\n'
        + '  wikiattrs          1\n'
        + '  wikilinks          3\n'
        + '  wikiembeds         0\n'
        + '\n'
        + 'types\n'
        + '\n'
        + '  doctypes           1\n'
        + '  attrtypes          1\n'
        + '  linktypes          1',
    });
  });

  it('empty garden', () => {
    return runCmdTestSync(mocks, {
      input: ['list'],
      cmd: ['list'],
      output:
        + 'structure\n'
        + '\n'
        + '  nodes              0\n'
        + '  tree               0\n'
        + '  web                0\n'
        + '  orphans            0\n'
        + '  isolates           0\n'
        + '\n'
        + 'references\n'
        + '\n'
        + '  wikiattrs          0\n'
        + '  wikilinks          0\n'
        + '  wikiembeds         0\n'
        + '\n'
        + 'types\n'
        + '\n'
        + '  doctypes           0\n'
        + '  attrtypes          0\n'
        + '  linktypes          0',
    });
  });

  it('garden with no tree (all orphans)', () => {
    // no index/ i.bonsai.md -> buildTreeSync returns undefined -> tree count 0
    fs.writeFileSync(path.join(testCwd, 'leaf.md'), '[[orphan]]\n', 'utf8');
    fs.writeFileSync(path.join(testCwd, 'orphan.md'), '', 'utf8');
    fs.writeFileSync(path.join(testCwd, 'isolate.md'), '', 'utf8');

    // empty doctype types file => doctypes count 0
    fs.writeFileSync('t.doc.toml', '', 'utf8');

    return runCmdTestSync(mocks, {
      input: ['list'],
      cmd: ['list'],
      output:
        + 'structure\n'
        + '\n'
        + '  nodes              3\n'
        + '  tree               0\n'
        + '  web                1\n'
        + '  orphans            3\n'
        + '  isolates           2\n'
        + '\n'
        + 'references\n'
        + '\n'
        + '  wikiattrs          0\n'
        + '  wikilinks          1\n'
        + '  wikiembeds         0\n'
        + '\n'
        + 'types\n'
        + '\n'
        + '  doctypes           0\n'
        + '  attrtypes          0\n'
        + '  linktypes          0',
    });
  });

});
