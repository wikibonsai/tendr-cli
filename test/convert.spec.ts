import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import type { TestMocks } from './types';
import { runCmdTestSync } from './runner';


let fakeProcessCwd: any;
let fakeConsoleLog: any;
const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');
const testFilePath: string = path.join(testCwd, 'conv.md');

const mocks: TestMocks = {
  fakeProcessCwd,
  fakeConsoleLog,
  testCwd,
  testFilePath,
};

describe('convert', () => {

  beforeEach(() => {
    if (!fs.existsSync(testCwd)) {
      // populate test files
      fs.mkdirSync(testCwd);
    }
    // fake 'process.cwd()'
    process.cwd = () => testCwd;
    mocks.fakeProcessCwd = sinon.spy(process, 'cwd');
    // fake console.log
    console.log = (msg) => msg + '\n';
    mocks.fakeConsoleLog = sinon.spy(console, 'log');
  });

  afterEach(() => {
    mocks.fakeProcessCwd.restore();
    mocks.fakeConsoleLog.restore();
  });

  describe('links', () => {

    beforeEach(() => {
      const fnameA: string = '';
      // populate test files
      if (!fs.existsSync(testCwd)) {
        // populate test files
        fs.mkdirSync(testCwd);
      }
      fs.writeFileSync(path.join(testCwd, 'fname-a.md'), fnameA);
    });

    afterEach(() => {
      fs.rmSync(testCwd, { recursive: true });
    });

    describe('mkdn -> wiki', () => {

      it('empty', runCmdTestSync(mocks, {
        icontent: 'no links here!',
        input: ['mkdntowiki'],
        cmd: ['mkdntowiki'],
        ocontent: 'no links here!',
      }));

      describe('attr', () => {

        beforeEach(() => {
          const fnameB: string = '';
          // populate test files
          if (!fs.existsSync(testCwd)) {
            // populate test files
            fs.mkdirSync(testCwd);
          }
          fs.writeFileSync(path.join(testCwd, 'fname-b.md'), fnameB);
        });

        it('single', runCmdTestSync(mocks, {
          icontent: ':attrtype:: [fname-a](/fname-a)\n',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: ':attrtype:: [[fname-a]]\n',
        }));

        it('list; comma', runCmdTestSync(mocks, {
          icontent: ':attrtype:: [fname-a](/fname-a), [fname-b](/fname-b)\n',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: ':attrtype:: [[fname-a]], [[fname-b]]\n',
        }));

        it.skip('list; comma; preserve whitespace', runCmdTestSync(mocks, {
          icontent: ':attrtype::[fname-a](/fname-a) ,  [fname-b](/fname-b)\n',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: ':attrtype::[[fname-a]] ,  [[fname-b]]\n',
        }));

        it('list; mkdn', runCmdTestSync(mocks, {
          icontent: ':attrtype::\n- [fname-a](/fname-a)\n- [fname-b](/fname-b)\n',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: ':attrtype::\n- [[fname-a]]\n- [[fname-b]]\n',
        }));

      });

      describe('link', () => {

        it('filename format', runCmdTestSync(mocks, {
          icontent: 'here is a link: [fname-a](/fname-a)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: 'here is a link: [[fname-a]]',
        }));

        it.skip('filename format; unslugify', runCmdTestSync(mocks, {
          icontent: 'here is a link: [fname-a](/fname-a)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: 'here is a link: [[FName A]]',
        }));

        it('label', runCmdTestSync(mocks, {
          icontent: '[label](/fname-a)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: '[[fname-a|label]]',
        }));

        it('zombie (defaults to filename format)', runCmdTestSync(mocks, {
          icontent: 'here is a link: [zombie](/zombie)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: 'here is a link: [[zombie]]',
        }));

        describe.skip('uri format', () => {

          // todo: simply stubbing the uris is proving exceedingly difficult...
          beforeEach(() => {
            // fake file uris
            // stub
            // urisStub = sinon.stub(util, 'getFileUris').returns([
            //   '/test/fixtures/fname-a.md'
            // ]);
            // mock
            // function mockGetFileUris() {
            //   return ['/test/fixtures/fname-a.md'];
            // }
            // originalGetFileUris = getFileUris;
            // getFileUris = mockGetFileUris;
            // fake
            // urisStub = sinon.fake.returns(['file1', 'file2', 'file3']); // Custom implementation for the spy
            // getFileUrisSpy = sinon.replace(util, 'getFileUris', urisStub);
            // spy
            // sinon.replace(util, 'getFileUris', urisStub);
            // urisStub = sinon.spy(util.getFileUris);
          });

          afterEach(() => {
            // stub
            // urisStub.restore();
            // mock
            // getFileUris = originalGetFileUris;
            // spy
            // getFileUrisSpy.restore();
          });

          it('relative path format', runCmdTestSync(mocks, {
            icontent: 'here is a link: [fname-a](/fixtures/fname-a)',
            input: ['mkdntowiki', '-F', 'relative'],
            cmd: ['mkdntowiki'],
            confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
            ocontent: 'here is a link: [[fname-a]]',
          }));

          it('absolute path format', runCmdTestSync(mocks, {
            icontent: 'here is a link: [fname-a](/test/fixtures/fname-a)',
            input: ['mkdntowiki', '-F', 'absolute'],
            cmd: ['mkdntowiki'],
            confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
            ocontent: 'here is a link: [[fname-a]]',
          }));

        });

      });

      describe('embed', () => {

        it.skip('markdown', runCmdTestSync(mocks, {
          icontent: '![](/fname-a)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: '![[fname-a]]',
        }));

        it('image', runCmdTestSync(mocks, {
          icontent: '![](/img.png)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: '![[img.png]]',
        }));

        it.skip('audio', runCmdTestSync(mocks, {
          icontent: '![](/aud.mp3)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: '![[aud.mp3]]',
        }));

        it.skip('video', runCmdTestSync(mocks, {
          icontent: '![](/vid.mp4)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          confirm: 'are you sure you want to convert [markdown](links) to [[wikirefs]]? [y/n]\n',
          ocontent: '![[vid.mp4]]',
        }));

      });

    });

    describe('wiki -> mkdn', () => {

      it('empty', runCmdTestSync(mocks, {
        icontent: 'no links here!',
        input: ['wikitomkdn'],
        cmd: ['wikitomkdn'],
        ocontent: 'no links here!',
      }));

      describe('attr', () => {

        beforeEach(() => {
          const fnameB: string = '';
          // populate test files
          if (!fs.existsSync(testCwd)) {
            // populate test files
            fs.mkdirSync(testCwd);
          }
          fs.writeFileSync(path.join(testCwd, 'fname-b.md'), fnameB);
        });

        it('single', runCmdTestSync(mocks, {
          icontent: ':attrtype:: [[fname-a]]\n',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: ':attrtype:: [fname-a](/fname-a)\n',
        }));

        it('list; comma', runCmdTestSync(mocks, {
          icontent: ':attrtype:: [[fname-a]], [[fname-b]]\n',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: ':attrtype:: [fname-a](/fname-a), [fname-b](/fname-b)\n',
        }));

        it.skip('list; comma; preserve whitespace', runCmdTestSync(mocks, {
          icontent: ':attrtype::[[fname-a]] ,  [[fname-b]]\n',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: ':attrtype::[fname-a](/fname-a) ,  [fname-b](/fname-b)\n',
        }));

        it('list; mkdn', runCmdTestSync(mocks, {
          icontent: ':attrtype::\n- [[fname-a]]\n- [[fname-b]]\n',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: ':attrtype::\n- [fname-a](/fname-a)\n- [fname-b](/fname-b)\n',
        }));

      });

      describe('link', () => {

        it('filename format', runCmdTestSync(mocks, {
          icontent: 'here is a link: [[fname-a]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: 'here is a link: [fname-a](/fname-a)',
        }));

        it('filename format; slugify', runCmdTestSync(mocks, {
          icontent: 'here is a link: [[FName A]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: 'here is a link: [FName A](/fname-a)',
        }));

        it('label', runCmdTestSync(mocks, {
          icontent: 'here is a link: [[fname-a|label]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: 'here is a link: [label](/fname-a)',
        }));

        it('zombie (defaults to filename format)', runCmdTestSync(mocks, {
          icontent: 'here is a link: [[zombie]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: 'here is a link: [zombie](/zombie)',
        }));

        describe.skip('uri format', () => {

          // todo: simply stubbing the uris is proving exceedingly difficult...
          beforeEach(() => {
            // fake file uris
            // stub
            // urisStub = sinon.stub(util, 'getFileUris').returns([
            //   '/test/fixtures/fname-a.md'
            // ]);
            // mock
            // function mockGetFileUris() {
            //   return ['/test/fixtures/fname-a.md'];
            // }
            // originalGetFileUris = getFileUris;
            // getFileUris = mockGetFileUris;
            // fake
            // urisStub = sinon.fake.returns(['file1', 'file2', 'file3']); // Custom implementation for the spy
            // getFileUrisSpy = sinon.replace(util, 'getFileUris', urisStub);
            // spy
            // sinon.replace(util, 'getFileUris', urisStub);
            // urisStub = sinon.spy(util.getFileUris);
          });

          afterEach(() => {
            // stub
            // urisStub.restore();
            // mock
            // getFileUris = originalGetFileUris;
            // spy
            // getFileUrisSpy.restore();
          });

          it('relative path format', runCmdTestSync(mocks, {
            icontent: 'here is a link: [[fname-a]]',
            input: ['wikitomkdn', '-F', 'relative'],
            cmd: ['wikitomkdn'],
            confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
            ocontent: 'here is a link: [fname-a](/fixtures/fname-a)',
          }));

          it('absolute path format', runCmdTestSync(mocks, {
            icontent: 'here is a link: [[fname-a]]',
            input: ['wikitomkdn', '-F', 'absolute'],
            cmd: ['wikitomkdn'],
            confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
            ocontent: 'here is a link: [fname-a](/test/fixtures/fname-a)',
          }));

        });

      });

      describe('embed', () => {

        it('markdown', runCmdTestSync(mocks, {
          icontent: 'here is an embed: ![[fname-a]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: 'here is an embed: [fname-a](/fname-a)',
        }));

        it('image', runCmdTestSync(mocks, {
          icontent: '![[img.png]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: '![](/img.png)',
        }));

        it.skip('audio', runCmdTestSync(mocks, {
          icontent: '![[aud.mp3]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: '![](/aud.mp3)',
        }));

        it.skip('video', runCmdTestSync(mocks, {
          icontent: '![[vid.mp4]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          confirm: 'are you sure you want to convert [[wikirefs]] to [markdown](links)? [y/n]\n',
          ocontent: '![](/vid.mp4)',
        }));

      });

    });

  });

  describe('aml', () => {

    describe('yaml -> caml', () => {

      it('empty', runCmdTestSync(mocks, {
        icontent: 'no yaml here!',
        input: ['yamltocaml'],
        cmd: ['yamltocaml'],
        ocontent: 'no yaml here!',
      }));

      describe('single', () => {

        it('null', runCmdTestSync(mocks, {
          icontent:
`---
empty: null
---
`,
          input: ['yamltocaml'],
          cmd: ['yamltocaml'],
          ocontent:
`: empty :: null
`,
        }));

        it('bool', runCmdTestSync(mocks, {
          icontent:
`---
success: true
---
`,
          input: ['yamltocaml'],
          cmd: ['yamltocaml'],
          ocontent:
`: success :: true
`,
        }));

        it('int', runCmdTestSync(mocks, {
          icontent:
`---
id: 12345
---
`,
          input: ['yamltocaml'],
          cmd: ['yamltocaml'],
          ocontent:
`: id :: 12345
`,
        }));

        it('float', runCmdTestSync(mocks, {
          icontent:
`---
value: 12.345
---
`,
          input: ['yamltocaml'],
          cmd: ['yamltocaml'],
          ocontent:
`: value :: 12.345
`,
        }));

        it('string', runCmdTestSync(mocks, {
          icontent:
`---
tldr: a file that has attributes which should be converted.
---
`,
          input: ['yamltocaml'],
          cmd: ['yamltocaml'],
          ocontent:
`: tldr :: a file that has attributes which should be converted.
`,
        }));

        it('string; quotes (double)', runCmdTestSync(mocks, {
          icontent:
`---
tldr: "a file that has attributes, which should be converted."
---
`,
          input: ['yamltocaml'],
          cmd: ['yamltocaml'],
          ocontent:
`: tldr :: a file that has attributes, which should be converted.
`,
        }));

        it.skip('string; quotes (double); generated caml string loses quotes', () => { return; });

        it('time', runCmdTestSync(mocks, {
          icontent:
`---
time: 2022-11-24 20:00:00 +08:00
---
`,
          input: ['yamltocaml'],
          cmd: ['yamltocaml'],
          ocontent:
`: time :: Thu Nov 24 2022 07:00:00 GMT-0500 (Eastern Standard Time)
`,
        }));

        it.skip('time; formatting', () => { return; });

      });

      describe.skip('list; comma-separated', () => { return; });
      describe.skip('list; mkdn-separated', () => { return; });

      it('leave nested objects in yaml format', runCmdTestSync(mocks, {
        icontent:
`---
tldr: a file that has attributes which should be converted.
nest-1:
  nested-key: nested value.
nest-2:
  - nested-array-key-a: nested value.
    nested-array-key-b: nested value.
---
`,
        input: ['yamltocaml'],
        cmd: ['yamltocaml'],
        ocontent:
`---
nest-1:
  nested-key: nested value.
nest-2:
  - nested-array-key-a: nested value.
    nested-array-key-b: nested value.
---
: tldr :: a file that has attributes which should be converted.
`,
      }));

    });

    describe('caml -> yaml', () => {

      it('empty', runCmdTestSync(mocks, {
        icontent: 'no caml here!',
        input: ['camltoyaml'],
        cmd: ['camltoyaml'],
        ocontent: 'no caml here!',
      }));

      describe('single', () => {

        it('null', runCmdTestSync(mocks, {
          icontent:
`: empty :: null
`,
          input: ['camltoyaml'],
          cmd: ['camltoyaml'],
          ocontent:
`---
empty: null
---
`,
        }));

        it('bool', runCmdTestSync(mocks, {
          icontent:
`: success :: true
`,
          input: ['camltoyaml'],
          cmd: ['camltoyaml'],
          ocontent:
`---
success: true
---
`,
        }));

        it('int', runCmdTestSync(mocks, {
          icontent:
`: id :: 12345
`,
          input: ['camltoyaml'],
          cmd: ['camltoyaml'],
          ocontent:
`---
id: 12345
---
`,
        }));

        it('float', runCmdTestSync(mocks, {
          icontent:
`: value :: 12.345
`,
          input: ['camltoyaml'],
          cmd: ['camltoyaml'],
          ocontent:
`---
value: 12.345
---
`,
        }));

        it('string', runCmdTestSync(mocks, {
          icontent:
`: tldr  :: a file that has attributes which should be converted.
`,
          input: ['camltoyaml'],
          cmd: ['camltoyaml'],
          ocontent:
`---
tldr: a file that has attributes which should be converted.
---
`,
        }));

        it('string; quotes (double)', runCmdTestSync(mocks, {
          icontent:
`: tldr  :: "a file that has attributes, which should be converted."
`,
          input: ['camltoyaml'],
          cmd: ['camltoyaml'],
          ocontent:
`---
tldr: '"a file that has attributes, which should be converted."'
---
`,
        }));

        it.skip('string; quotes (double); todo: generated yaml adds single quotes', () => { return; });

        it('time', runCmdTestSync(mocks, {
          icontent:
`: time :: 2022-11-24 20:00:00 +08:00
`,
          input: ['camltoyaml'],
          cmd: ['camltoyaml'],
          ocontent:
`---
time: 2022-11-24T12:00:00.000Z
---
`,
        }));

        it.skip('time; formatting', () => { return; });

      });

      describe.skip('list; comma-separated', () => { return; });
      describe.skip('list; mkdn-separated', () => { return; });

    });

  });

});
