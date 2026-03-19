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
    // `rename.ts` reads `./config.toml` relative to the real process cwd.
    // Our tests mock `process.cwd()` to `testCwd`, but that does not affect
    // these relative reads.
    fs.writeFileSync(
      'config.toml',
      `[format]\n` + 'title_case = "Title Case"\n',
      'utf8',
    );

    const fnameA: string = `
: title    :: Old Title
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
: title    :: Old Title G
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
    if (fs.existsSync('config.toml')) {
      fs.rmSync('config.toml');
    }
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
  new-name
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
    contents: {
      'new-name':
`
: title    :: New Name
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
: title    :: Old Title G
![[new-name]]
`,
    },
  }));

  it('title; --no-title skips title update', runCmdTestSync(mocks, {
    input: ['rename', 'fname-a', 'new-name', '--no-title'],
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
: title    :: Old Title
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
: title    :: Old Title G
![[new-name]]
`,
    },
  }));

  it('title; --title "Custom Title" overrides computed title', runCmdTestSync(mocks, {
    input: ['rename', 'fname-a', 'new-name', '--title', 'Custom Title'],
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
  new-name
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
    contents: {
      'new-name':
`
: title    :: Custom Title
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
: title    :: Old Title G
![[new-name]]
`,
    },
  }));

  describe('title; --title-case', () => {
    it('Title Case (default)', runCmdTestSync(mocks, {
      input: ['rename', 'fname-a', 'new-name', '--title-case', 'Title Case'],
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
  new-name
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
      contents: {
        'new-name':
`
: title    :: New Name
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
: title    :: Old Title G
![[new-name]]
`,
      },
    }));

    it('lower case', runCmdTestSync(mocks, {
      input: ['rename', 'fname-a', 'new-name', '--title-case', 'lower case'],
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
  new-name
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
      contents: {
        'new-name':
`
: title    :: new name
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
: title    :: Old Title G
![[new-name]]
`,
      },
    }));

    it('kabob-case', runCmdTestSync(mocks, {
      input: ['rename', 'fname-a', 'new-name', '--title-case', 'kabob-case'],
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
  new-name
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
      contents: {
        'new-name':
`
: title    :: new-name
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
: title    :: Old Title G
![[new-name]]
`,
      },
    }));

    it('snake_case', runCmdTestSync(mocks, {
      input: ['rename', 'fname-a', 'new-name', '--title-case', 'snake_case'],
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
  new-name
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
      contents: {
        'new-name':
`
: title    :: new_name
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
: title    :: Old Title G
![[new-name]]
`,
      },
    }));
  });

  it('base; no file + no refs', runCmdTestSync(mocks, {
    input: ['rename', 'imaginary-doc', 'new-name'],
    cmd: ['rename'],
    args: {
      ['old-fname']: 'imaginary-doc',
      ['new-fname']: 'new-name',
    },
    confirm: 'are you sure you want to rename "imaginary-doc" to "new-name"? [y/n]\n',
    output:
`\x1B[32mUPDATED FILENAMES:\x1B[39m
\x1B[2m  no file named: 'imaginary-doc'\x1B[22m
\x1B[32mUPDATED FILE CONTENT:\x1B[39m
\x1B[2m  no wikirefs named: 'imaginary-doc'\x1B[22m`,
    contents: {
      'fname-a':
`
: title    :: Old Title
:reftype::[[fname-b]]
:attrtype::[[fname-c]]

:linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
      'fname-b': `
:attrtype::[[fname-a]]
`,
      'fname-c': `
:reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
      'fname-d': `
[[fname-a]]
`,
      'fname-e': `
[[fname-a|label]]
`,
      'fname-f': `
[[no-doc]]
`,
      'fname-g': `
: title    :: Old Title G
![[fname-a]]
`,
    },
  }));

  it('base; has file + no refs', runCmdTestSync(mocks, {
    input: ['rename', 'fname-g', 'new-name'],
    cmd: ['rename'],
    args: {
      ['old-fname']: 'fname-g',
      ['new-fname']: 'new-name',
    },
    confirm: 'are you sure you want to rename "fname-g" to "new-name"? [y/n]\n',
    output:
`\x1B[32mUPDATED FILENAMES:\x1B[39m
  fname-g -> new-name
\x1B[32mUPDATED FILE CONTENT:\x1B[39m
  new-name`,
    contents: {
      'fname-a':
`
: title    :: Old Title
:reftype::[[fname-b]]
:attrtype::[[fname-c]]

:linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[no-doc]]
`,
      'fname-b': `
:attrtype::[[fname-a]]
`,
      'fname-c': `
:reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
      'fname-d': `
[[fname-a]]
`,
      'fname-e': `
[[fname-a|label]]
`,
      'fname-f': `
[[no-doc]]
`,
      'new-name': `
: title    :: New Name
![[fname-a]]
`,
    },
  }));

  it('base; no file + all refs', runCmdTestSync(mocks, {
    input: ['rename', 'no-doc', 'new-name'],
    cmd: ['rename'],
    args: {
      ['old-fname']: 'no-doc',
      ['new-fname']: 'new-name',
    },
    confirm: 'are you sure you want to rename "no-doc" to "new-name"? [y/n]\n',
    output:
`\x1B[32mUPDATED FILENAMES:\x1B[39m
\x1B[2m  no file named: 'no-doc'\x1B[22m
\x1B[32mUPDATED FILE CONTENT:\x1B[39m
  fname-a
  fname-f`,
    contents: {
      'fname-a':
`
: title    :: Old Title
:reftype::[[fname-b]]
:attrtype::[[fname-c]]

:linktype::[[fname-d]] and some text to illustrate that this is a typed wikilink!

[[fname-e]]

[[new-name]]
`,
      'fname-b': `
:attrtype::[[fname-a]]
`,
      'fname-c': `
:reftype::[[fname-e]] and some text to illustrate that this is a typed wikilink!
:linktype::[[fname-a]] and some text to illustrate that this is a typed wikilink!
`,
      'fname-d': `
[[fname-a]]
`,
      'fname-e': `
[[fname-a|label]]
`,
      'fname-f': `
[[new-name]]
`,
      'fname-g': `
: title    :: Old Title G
![[fname-a]]
`,
    },
  }));

  it('base; aborted', runCmdTestSync(mocks, {
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
  fname-new
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
        contents: {
          'fname-new':
`
: title    :: Fname New
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
: title    :: Old Title G
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
: title    :: New A
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
: title    :: New G
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
  new-name
  fname-b
  fname-c
  fname-d
  fname-e
  fname-g`,
      contents: {
        'new-name':
`
: title    :: New Name
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
: title    :: Old Title G
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
