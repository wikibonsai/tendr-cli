import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import { TestMocks } from './types';
import { runCmdTestSync } from './runner';


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

  it('base; file + all refs', runCmdTestSync(mocks, {
    input: ['rename', 'fname-a', 'new-name'],
    cmd: ['rename'],
    args: {
      ['old-fname']: 'fname-a',
      ['new-fname']: 'new-name',
    },
    confirm: 'are you sure you want to rename "fname-a" to "new-name"? [y/n]\n',
    output:
`\x1B[32mUPDATED FILENAMES:\x1B[39m
  fname-a -> new-name
\x1B[32mUPDATED FILE CONTENT:\x1B[39m
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

  it('aborted', runCmdTestSync(mocks, {
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

    describe('regex', () => {

      it('single file', runCmdTestSync(mocks, {
        input: ['rename', '(a)$', 'new', '-r'],
        cmd: ['rename'],
        args: {
          ['old-fname']: '(a)$',
          ['new-fname']: 'new',
        },
        confirm: 'are you sure you want to rename "(a)$" to "new"? [y/n]\n',
        output:
`\x1B[32mUPDATED FILENAMES:\x1B[39m
  fname-a -> fname-new
\x1B[32mUPDATED FILE CONTENT:\x1B[39m
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
        contents: {
          'fname-new':
`
:reftype::[[fname-b]]
:attrtype::[[fname-c]]

:linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
          'fname-b': `
:attrtype::[[fname-new]]
`,
          'fname-c': `
:reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:linktype::[[fname-new]] and some text to illustrate that this is a typed wikilink!
`,
          'fname-d': `
[[fname-new]]
`,
          'fname-e': `
[[fname-new|label]]
`,
          'fname-f': `
[[no-doc]]
`,
          'fname-g': `
![[fname-new]]
`,
        },
      }));

      it('multiple files\' content', runCmdTestSync(mocks, {
        input: ['rename', '^(fname)', 'new', '-r'],
        cmd: ['rename'],
        args: {
          ['old-fname']: '^(fname)',
          ['new-fname']: 'new',
        },
        confirm: 'are you sure you want to rename "^(fname)" to "new"? [y/n]\n',
        output:
`\x1B[32mUPDATED FILENAMES:\x1B[39m
  fname-a -> new-a
  fname-b -> new-b
  fname-c -> new-c
  fname-d -> new-d
  fname-e -> new-e
  fname-f -> new-f
  fname-g -> new-g
\x1B[32mUPDATED FILE CONTENT:\x1B[39m
  new-a
  new-b
  new-c
  new-d
  new-e
  new-g`,
        contents: {
          'new-a':
`
:reftype::[[new-b]]
:attrtype::[[new-c]]

:linktype::[[new-d]] and some text to illustrate that this is a typed wikilink!

[[new-e]]

[[no-doc]]
`,
          'new-b': `
:attrtype::[[new-a]]
`,
          'new-c': `
:reftype::[[new-e]] and some text to illustrate that this is a typed wikilink!
:linktype::[[new-a]] and some text to illustrate that this is a typed wikilink!
`,
          'new-d': `
[[new-a]]
`,
          'new-e': `
[[new-a|label]]
`,
          'new-f': `
[[no-doc]]
`,
          'new-g': `
![[new-a]]
`,
        },
      }));

      describe.skip('warn', () => {

        // todo
        it.skip('first argument is a valid regex expression without regex option', () => { return ;});
    
      });

    });

    it('force', runCmdTestSync(mocks, {
      input: ['rename', 'fname-a', 'new-name', '-f'],
      cmd: ['rename'],
      args: {
        ['old-fname']: 'fname-a',
        ['new-fname']: 'new-name',
      },
      output:
`\x1B[32mUPDATED FILENAMES:\x1B[39m
  fname-a -> new-name
\x1B[32mUPDATED FILE CONTENT:\x1B[39m
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

  describe.skip('warn (execute, but warn user)', () => {

    // todo

  });

  describe('error', () => {

    it.skip('problem with fs.writeFileSync() of file to update', () => { return ;});

  });

});
