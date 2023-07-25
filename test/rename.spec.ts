import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import { TestMocks } from './types';
import { runCmdTest } from './runner';


let fakeProcessCwd: any;
let fakeConsoleLog: any;
const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');

const mocks: TestMocks = {
  fakeProcessCwd,
  fakeConsoleLog,
  testCwd,
};

describe('rename', () => {

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
[[fname-a|label]]
`;
    const fnameF: string = `
[[no-doc]]
`;
    const fnameG: string = `
![[fname-a]]
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
    mocks.fakeProcessCwd = sinon.spy(process, 'cwd');
    // fake console.log
    console.log = (msg) => msg + '\n';
    mocks.fakeConsoleLog = sinon.spy(console, 'log');
  });

  afterEach(() => {
    fs.rmSync(testCwd, { recursive: true });
    mocks.fakeConsoleLog.restore();
  });

  it('base; file + all refs', runCmdTest(mocks, {
    input: ['rename', 'fname-a', 'new-name'],
    cmd: ['rename'],
    args: {
      ['old-fname']: 'fname-a',
      ['new-fname']: 'new-name',
    },
    confirm: 'are you sure you want to rename "fname-a" to "new-name"? [y/n]\n',
    output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
    contents: {
      'new-name':
`
:reftype::[[fname-b]]
:attrtype::[[fname-c]]

:linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
      'fname-b': `
:attrtype::[[new-name]]
`,
      'fname-c': `
:reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:linktype::[[new-name]] and some text to illustrate that this is a typed wikilink!
`,
      'fname-d': `
[[new-name]]
`,
      'fname-e': `
[[new-name|label]]
`,
      'fname-f': `
[[no-doc]]
`,
      'fname-g': `
![[new-name]]
`,
    },
  }));

  it('aborted', runCmdTest(mocks, {
    input: ['rename', 'fname-a', 'new-name'],
    cmd: ['rename'],
    args: {
      ['old-fname']: 'fname-a',
      ['new-fname']: 'new-name',
    },
    confirm: 'are you sure you want to rename "fname-a" to "new-name"? [y/n]\n',
    aborted: true,
  }));

  describe('options', () => {

    it('force', runCmdTest(mocks, {
      input: ['rename', 'fname-a', 'new-name', '-f'],
      cmd: ['rename'],
      args: {
        ['old-fname']: 'fname-a',
        ['new-fname']: 'new-name',
      },
      output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
      contents: {
        'new-name':
`
:reftype::[[fname-b]]
:attrtype::[[fname-c]]

:linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
        'fname-b': `
:attrtype::[[new-name]]
`,
        'fname-c': `
:reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:linktype::[[new-name]] and some text to illustrate that this is a typed wikilink!
`,
        'fname-d': `
[[new-name]]
`,
        'fname-e': `
[[new-name|label]]
`,
        'fname-f': `
[[no-doc]]
`,
        'fname-g': `
![[new-name]]
`,
      },
    }));

  });

  describe('warn (execute, but warn user)', () => {

    // todo

  });

  describe('error', () => {

    it.skip('problem with fs.writeFileSync() of file to update', () => { return ;});

  });

});
