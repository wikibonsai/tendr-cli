import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import type { TestMocks } from './types';
import { runCmdTest } from './runner';


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
    if (fs.existsSync('config.toml')) {
      fs.rmSync('config.toml');
    }
    if (fs.existsSync('t.doc.toml')) {
      fs.rmSync('t.doc.toml');
    }
    if (fs.existsSync(testCwd)) {
      fs.rmSync(testCwd, { recursive: true });
    }
    mocks.fakeConsoleLog.restore();
    mocks.fakeConsoleWarn.restore();
    mocks.fakeConsoleError.restore();
    mocks.fakeProcessCwd.restore();
  });

  describe('tree', () => {

    describe('default', () => {

      it('single index file', runCmdTest(mocks, {
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

      describe('multiple index files', () => {

        beforeEach(() => {
          // add new index file
          const ibranch: string = '- [[fname-j]]\n';
          fs.writeFileSync(path.join(testCwd, 'i.branch.md'), ibranch);
          // append reference to root file
          fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '  - [[i.branch]]\n');
        });

        afterEach(() => {
          fs.rmSync(path.join(testCwd, 'i.branch.md'));
        });

        it('multiple index files', runCmdTest(mocks, {
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
        }, SHOW_RESULT));

      });

    });

    // also custom configs in default config locations
    describe('custom config content', () => {

      beforeEach(() => {
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
        // make custom index dir
        if (!fs.existsSync(path.join(testCwd, 'custom-index'))) {
          // populate test files
          fs.mkdirSync(path.join(testCwd, 'custom-index'));
        }
        // move resources to custom locations
        fs.renameSync(path.join(testCwd, 'i.bonsai.md'), path.join(testCwd, 'custom-index', 'custom-bonsai.md'));
      });

      it('config + doctypes (root from dir, not prefix)', runCmdTest(mocks, {
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
      }));

    });

    describe('custom config content and custom config location', () => {

      beforeEach(() => {
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
        // move resources to custom locations
        fs.renameSync('config.toml', 'custom-config.toml');
        fs.renameSync('t.doc.toml', 'custom-doctypes.toml');
        // make custom index dir
        if (!fs.existsSync(path.join(testCwd, 'custom-index'))) {
          fs.mkdirSync(path.join(testCwd, 'custom-index'));
        }
        // move resources to custom locations
        fs.renameSync(path.join(testCwd, 'i.bonsai.md'), path.join(testCwd, 'custom-index', 'custom-bonsai.md'));
      });

      afterEach(() => {
        if (fs.existsSync('custom-config.toml')) {
          fs.rmSync('custom-config.toml');
        }
        if (fs.existsSync('custom-doctypes.toml')) {
          fs.rmSync('custom-doctypes.toml');
        }
      });

      it('config + doctypes', runCmdTest(mocks, {
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
      }));

    });

    describe('no configs', () => {

      // todo: load from default rootname and glob pattern?
      beforeEach(() => {
        if (fs.existsSync('config.toml')) {
          fs.rmSync('config.toml');
        }
        if (fs.existsSync('t.doc.toml')) {
          fs.rmSync('t.doc.toml');
        }
        // make index dir
        if (!fs.existsSync(path.join(testCwd, 'index'))) {
          fs.mkdirSync(path.join(testCwd, 'index'));
        }
        // move resources to default locations
        fs.renameSync(path.join(testCwd, 'i.bonsai.md'), path.join(testCwd, 'index', 'i.bonsai.md'));
      });

      it('config + doctypes', runCmdTest(mocks, {
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
      }));

    });

    describe('custom options', () => {

      beforeEach(() => {
        // remove configs
        fs.rmSync('config.toml');
        fs.rmSync('t.doc.toml');
        // move tree files
        // make custom index dir
        if (!fs.existsSync(path.join(testCwd, 'custom-index'))) {
          fs.mkdirSync(path.join(testCwd, 'custom-index'));
        }
        // move resources to custom locations
        fs.renameSync(path.join(testCwd, 'i.bonsai.md'), path.join(testCwd, 'custom-index', 'custom-bonsai.md'));
      });

      afterEach(() => {
        if (fs.existsSync('custom-config.toml')) {
          fs.rmSync('custom-config.toml');
        }
        if (fs.existsSync('custom-doctypes.toml')) {
          fs.rmSync('custom-doctypes.toml');
        }
      });

      it('root filename + index files glob', runCmdTest(mocks, {
        input: ['tree', '-r', 'custom-bonsai', '-g', 'custom-index/**/*'],
        cmd: ['tree'],
        args: {},
        opts: {
          root: 'custom-bonsai',
          glob: 'custom-index/**/*',
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
      }));

    });

    describe('strip metadata', () => {

      describe('caml', () => {

        beforeEach(() => {
          // populate test files
          if (!fs.existsSync(testCwd)) {
            fs.mkdirSync(testCwd);
          }
          const metadata = 
`
: title    :: a title
: attrtype :: [[fname-b]]
`;
          // Write the combined data back to the file
          fs.writeFileSync(path.join(testCwd, 'fname-a'), metadata, 'utf8');
        });

        it('caml', runCmdTest(mocks, {
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
        }));

      });

      describe('yaml', () => {

        beforeEach(() => {
          // populate test files
          if (!fs.existsSync(testCwd)) {
            fs.mkdirSync(testCwd);
          }
          const metadata = 
`
---
title: a title
---
`;
          // Write the combined data back to the file
          fs.writeFileSync(path.join(testCwd, 'fname-a'), metadata, 'utf8');
        });

        it('yaml', runCmdTest(mocks, {
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
        }));

      });

    });

    describe('warn (execute, but warn user)', () => {

      // todo

    });

    describe('error (do not execute)', () => {

      it('no root', runCmdTest(mocks, {
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

      it('no index files', runCmdTest(mocks, {
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

      describe('invalid tree', () => {

        beforeEach(() => {
          // append duplicate wikilink to root file
          fs.appendFileSync(path.join(testCwd, 'i.bonsai.md'), '- [[fname-a]]\n');
        });

        it('duplicates found', runCmdTest(mocks, {
          input: ['tree'],
          cmd: ['tree'],
          args: {},
          opts: {},
          error:
`Tree did not build, duplicate nodes found:

fname-a

`,
        }));

      });

    });

  });

});
