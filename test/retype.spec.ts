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

describe('retyperef', () => {

  beforeEach(() => {
    const fnameA: string = `
:old-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`;
    const fnameB: string = `
:old-attrtype::[[fname-a]]
`;
    const fnameC: string = `
:old-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`;
    const fnameD: string = `
[[fname-a]]
`;
    const fnameE: string = `
[[no-doc]]
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

  it('base; equivalent to ref', runCmdTestSync(mocks, {
    input: ['retyperef', 'old-reftype', 'new-reftype'],
    cmd: ['retyperef'],
    args: {
      ['old-type']: 'old-reftype',
      ['new-type']: 'new-reftype',
    },
    opts: {},
    confirm: 'are you sure you want to retype reftype "old-reftype" to "new-reftype"? [y/n]\n',
    output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-a
  fname-c`,
    contents: {
      'fname-a': `
:new-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
      'fname-b': `
:old-attrtype::[[fname-a]]
`,
      'fname-c': `
:new-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
      'fname-d': `
[[fname-a]]
`,
      'fname-e': `
[[no-doc]]
`,
    },
  }));

  describe('kind', () => {

    it('ref; attr + link', runCmdTestSync(mocks, {
      input: ['retyperef', 'old-reftype', 'new-reftype', '-k', 'ref'],
      cmd: ['retyperef'],
      args: {
        ['old-type']: 'old-reftype',
        ['new-type']: 'new-reftype',
      },
      opts: { kind: 'reftype' },
      confirm: 'are you sure you want to retype reftype "old-reftype" to "new-reftype"? [y/n]\n',
      output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-a
  fname-c`,
      contents: {
        'fname-a': `
:new-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
        'fname-b': `
:old-attrtype::[[fname-a]]
`,
        'fname-c': `
:new-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
        'fname-d': `
[[fname-a]]
`,
        'fname-e': `
[[no-doc]]
`,
      },
    }));

    it('attr', runCmdTestSync(mocks, {
      input: ['retyperef', 'old-attrtype', 'new-attrtype', '-k', 'attr'],
      cmd: ['retyperef'],
      args: {
        ['old-type']: 'old-attrtype',
        ['new-type']: 'new-attrtype',
      },
      opts: { kind: 'attrtype' },
      confirm: 'are you sure you want to retype attrtype "old-attrtype" to "new-attrtype"? [y/n]\n',
      output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-a
  fname-b`,
      contents: {
        'fname-a':
`
:old-reftype::[[fname-b]]
:new-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
        'fname-b': `
:new-attrtype::[[fname-a]]
`,
        'fname-c': `
:old-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
        'fname-d': `
[[fname-a]]
`,
        'fname-e': `
[[no-doc]]
`,
      },
    }));

    it('link', runCmdTestSync(mocks, {
      input: ['retyperef', 'old-linktype', 'new-linktype', '-k', 'link'],
      cmd: ['retyperef'],
      args: {
        ['old-type']: 'old-linktype',
        ['new-type']: 'new-linktype',
      },
      opts: { kind: 'linktype' },
      confirm: 'are you sure you want to retype linktype "old-linktype" to "new-linktype"? [y/n]\n',
      output:
`\x1B[32mUPDATED FILES:\x1B[39m
  fname-a
  fname-c`,
      contents: {
        'fname-a':
`
:old-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:new-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
        'fname-b': `
:old-attrtype::[[fname-a]]
`,
        'fname-c': `
:old-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:new-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
        'fname-d': `
[[fname-a]]
`,
        'fname-e': `
[[no-doc]]
`,
      },
    }));

  });

  it('none to update', runCmdTestSync(mocks, {
    input: ['retyperef', 'no-type', 'new-no-type'],
    cmd: ['retyperef'],
    args: {
      ['old-type']: 'no-type',
      ['new-type']: 'new-no-type',
    },
    opts: {},
    confirm: 'are you sure you want to retype reftype "no-type" to "new-no-type"? [y/n]\n',
    output:
`\x1B[32mUPDATED FILES:\x1B[39m
\x1B[2m  none\x1B[22m`,
    contents: {
      'fname-a':
`
:old-reftype::[[fname-b]]
:old-attrtype::[[fname-c]]

:old-linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
      'fname-b': `
:old-attrtype::[[fname-a]]
`,
      'fname-c': `
:old-reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:old-linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
      'fname-d': `
[[fname-a]]
`,
      'fname-e': `
[[no-doc]]
`,
    },
  }));

  describe('warn (execute, but warn user)', () => {

    // todo

  });

  describe('error', () => {

    it.skip('problem with fs.writeFileSync() of file to update', () => { return ;});

  });

});
