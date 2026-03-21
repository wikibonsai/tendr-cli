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

describe('tree', () => {

  beforeEach(() => {
    const config: string =
`[garden]
root    = 'i.bonsai'
`;
    const doctypes: string =
`
[index]
path   = "/index/"
prefix = "i."
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
    if (fs.existsSync('custom-config.toml')) {
      fs.rmSync('custom-config.toml');
    }
    if (fs.existsSync('custom-doctypes.toml')) {
      fs.rmSync('custom-doctypes.toml');
    }
    mocks.fakeConsoleLog.restore();
    mocks.fakeConsoleWarn.restore();
    mocks.fakeConsoleError.restore();
    mocks.fakeProcessCwd.restore();
  });

  describe('base', () => {

    it('single index file', runCmdTestSync(mocks, {
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
    }, SHOW_RESULT));

    it('multiple index files', () => {
      const ibranch: string = '- [[fname-j]]\n';
      fs.writeFileSync(path.join(testCwd, 'i.branch.md'), ibranch);
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '  - [[i.branch]]\n');
      runCmdTestSync(mocks, {
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
      }, SHOW_RESULT)();
    });

  });

  describe('custom config', () => {

    it('content; config + doctypes (root from dir, not prefix)', () => {
      const config: string =
`[garden]
root    = 'custom-bonsai'
`;
      const doctypes: string =
`
[index]
path   = "/custom-index/"
`;
      fs.writeFileSync('config.toml', config);
      fs.writeFileSync('t.doc.toml', doctypes);
      if (!fs.existsSync(path.join(testCwd, 'custom-index'))) {
        fs.mkdirSync(path.join(testCwd, 'custom-index'));
      }
      fs.renameSync(path.join(testCwd, 'i.bonsai.md'), path.join(testCwd, 'custom-index', 'custom-bonsai.md'));
      runCmdTestSync(mocks, {
        input: ['tree'],
        cmd: ['tree'],
        args: {},
        opts: {},
        output:
`\x1B[33mcustom-bonsai\x1B[39m
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
      })();
    });

    it('content + location; config + doctypes', () => {
      const config: string =
`[garden]
root    = 'custom-bonsai'
`;
      const doctypes: string =
`
[index]
path   = "/custom-index/"
`;
      fs.writeFileSync('config.toml', config);
      fs.writeFileSync('t.doc.toml', doctypes);
      fs.renameSync('config.toml', 'custom-config.toml');
      fs.renameSync('t.doc.toml', 'custom-doctypes.toml');
      if (!fs.existsSync(path.join(testCwd, 'custom-index'))) {
        fs.mkdirSync(path.join(testCwd, 'custom-index'));
      }
      fs.renameSync(path.join(testCwd, 'i.bonsai.md'), path.join(testCwd, 'custom-index', 'custom-bonsai.md'));
      runCmdTestSync(mocks, {
        input: ['tree', '-c', './custom-config.toml', '-d', 'custom-doctypes.toml'],
        cmd: ['tree'],
        args: {},
        opts: {
          config: './custom-config.toml',
          doctype: 'custom-doctypes.toml',
        },
        output:
`\x1B[33mcustom-bonsai\x1B[39m
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
      })();
    });

  });

  describe('no configs', () => {

    it('config + doctypes', () => {
      if (fs.existsSync('config.toml')) {
        fs.rmSync('config.toml');
      }
      if (fs.existsSync('t.doc.toml')) {
        fs.rmSync('t.doc.toml');
      }
      if (!fs.existsSync(path.join(testCwd, 'index'))) {
        fs.mkdirSync(path.join(testCwd, 'index'));
      }
      fs.renameSync(path.join(testCwd, 'i.bonsai.md'), path.join(testCwd, 'index', 'i.bonsai.md'));
      runCmdTestSync(mocks, {
        input: ['tree'],
        cmd: ['tree'],
        args: {},
        opts: {},
        warn: '\x1B[33mError: ENOENT: no such file or directory, open \'./config.toml\'\x1B[39m',
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
      })();
    });

  });

  describe('custom options', () => {

    it('root filename + index files glob', () => {
      fs.rmSync('config.toml');
      fs.rmSync('t.doc.toml');
      if (!fs.existsSync(path.join(testCwd, 'custom-index'))) {
        fs.mkdirSync(path.join(testCwd, 'custom-index'));
      }
      fs.renameSync(path.join(testCwd, 'i.bonsai.md'), path.join(testCwd, 'custom-index', 'custom-bonsai.md'));
      runCmdTestSync(mocks, {
        input: ['tree', '-r', 'custom-bonsai', '-g', 'custom-index/**/*'],
        cmd: ['tree'],
        args: {},
        opts: {
          root: 'custom-bonsai',
          glob: 'custom-index/**/*',
        },
        warn: '\x1B[33mError: ENOENT: no such file or directory, open \'./config.toml\'\x1B[39m',
        output:
`\x1B[33mcustom-bonsai\x1B[39m
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
      })();
    });

  });

  describe('strip metadata', () => {

    it('caml', () => {
      if (!fs.existsSync(testCwd)) {
        fs.mkdirSync(testCwd);
      }
      const metadata =
`
: title    :: a title
: attrtype :: [[fname-b]]
`;
      fs.writeFileSync(path.join(testCwd, 'fname-a'), metadata, 'utf8');
      runCmdTestSync(mocks, {
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
      })();
    });

    it('yaml', () => {
      if (!fs.existsSync(testCwd)) {
        fs.mkdirSync(testCwd);
      }
      const metadata =
`
---
title: a title
---
`;
      fs.writeFileSync(path.join(testCwd, 'fname-a'), metadata, 'utf8');
      runCmdTestSync(mocks, {
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
      })();
    });

  });

  describe('warn', () => {

    it('orphan index/trunk files', () => {
      fs.writeFileSync(path.join(testCwd, 'i.trunk-1.md'), '- [[fname-1]]\n');
      fs.writeFileSync(path.join(testCwd, 'i.trunk-2.md'), '- [[fname-2]]\n');
      runCmdTestSync(mocks, {
        input: ['tree'],
        cmd: ['tree'],
        args: {},
        opts: {},
        warn: '',
        output:
          '\x1B[33mi.bonsai\x1B[39m\n'
        + '\x1B[33m\x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-a\x1B[39m\n'
        + '\x1B[32m\x1B[39m    \x1B[33m├── \x1B[39m\x1B[32mfname-b\x1B[39m\n'
        + '\x1B[32m\x1B[39m    \x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-f\x1B[39m\n'
        + '\x1B[32m\x1B[39m    \x1B[33m├── \x1B[39m\x1B[32mfname-c\x1B[39m\n'
        + '\x1B[32m\x1B[39m    \x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-g\x1B[39m\n'
        + '\x1B[32m\x1B[39m    \x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[2mfname-h\x1B[22m\n'
        + '\x1B[2m\x1B[22m    \x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[2mfname-i\x1B[22m\n'
        + '\x1B[2m\x1B[22m    \x1B[33m├── \x1B[39m\x1B[32mfname-d\x1B[39m\n'
        + '\x1B[32m\x1B[39m    \x1B[33m└── \x1B[39m\x1B[32mfname-e\x1B[39m\n'
        + '\x1B[32m\x1B[39m',
      })();
    });

    it('missing; - markdown bullet', () => {
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '[[no-mkdn-bullet]]\n');
      runCmdTestSync(mocks, {
        input: ['tree'],
        cmd: ['tree'],
        args: {},
        opts: {},
        output:
          '\x1B[33mi.bonsai\x1B[39m\n'
        + '\x1B[33m\x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-a\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-b\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-f\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-c\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-g\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[2mfname-h\x1B[22m\n'
        + '\x1B[2m\x1B[22m\x1B[33m|   \x1B[39m\x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[2mfname-i\x1B[22m\n'
        + '\x1B[2m\x1B[22m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-d\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-e\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m└── \x1B[39m\x1B[2mno-mkdn-bullet\x1B[22m\n'
        + '\x1B[2m\x1B[22m',
      })();
    });

    it('missing; [[wikilink]]', () => {
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '- no-wikilink\n');
      runCmdTestSync(mocks, {
        input: ['tree'],
        cmd: ['tree'],
        args: {},
        opts: {},
        output:
          '\x1B[33mi.bonsai\x1B[39m\n'
        + '\x1B[33m\x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-a\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-b\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-f\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-c\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-g\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[2mfname-h\x1B[22m\n'
        + '\x1B[2m\x1B[22m\x1B[33m|   \x1B[39m\x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[2mfname-i\x1B[22m\n'
        + '\x1B[2m\x1B[22m\x1B[33m|   \x1B[39m\x1B[33m├── \x1B[39m\x1B[32mfname-d\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m|   \x1B[39m\x1B[33m└── \x1B[39m\x1B[32mfname-e\x1B[39m\n'
        + '\x1B[32m\x1B[39m\x1B[33m└── \x1B[39m\x1B[2mno-wikilink\x1B[22m\n'
        + '\x1B[2m\x1B[22m',
      })();
    });

  });

  describe('error', () => {

    it('no root', runCmdTestSync(mocks, {
      input: ['tree', '-r', 'no-root'],
      cmd: ['tree'],
      args: {},
      opts: {
        root: 'no-root',
        r: 'no-root',
      },
      warn: '\x1B[33munable to find root with name: "no-root"\x1B[39m',
      error: '\x1B[31munable to build tree\x1B[39m',
    }));

    it('no index files', runCmdTestSync(mocks, {
      input: ['tree', '-g', 'no-index/**/*'],
      cmd: ['tree'],
      args: {},
      opts: {
        glob: 'no-index/**/*',
        g: 'no-index/**/*',
      },
      warn: '\x1B[33mno index files found at location: "no-index/**/*"\x1B[39m',
      error: '\x1B[31munable to build tree\x1B[39m',
    }));

    it('duplicates', () => {
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '- [[fname-a]]\n');
      runCmdTestSync(mocks, {
        input: ['tree'],
        cmd: ['tree'],
        args: {},
        opts: {},
        error:
          'semtree.lint(): duplicate entity names found:\n'
        + '\n'
        + '- "fname-a"\n'
        + '  - File "i.bonsai" Line 1\n'
        + '  - File "i.bonsai" Line 10\n'
      })();
    });

    it('improper indentation', () => {
      fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), ' - [[bad-indentation]]\n');
      runCmdTestSync(mocks, {
        input: ['tree'],
        cmd: ['tree'],
        args: {},
        opts: {},
        error:
          'semtree.lint(): improper indentation found:\n'
        + '\n'
        + '- File "i.bonsai" Line 10 (inconsistent indentation): " - [[bad-indentation]]"\n'
      })();
    });

  });

});
