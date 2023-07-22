import assert from 'node:assert/strict';
import sinon from 'sinon';

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';

import type { CommandTestCase } from './types';
import { tendr } from '../src/tendr';


let fakeProcessCwd: any;
const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');
let testFilePath: string;

const testConv = (test: CommandTestCase) => () => {
  ////
  // setup
  fs.writeFileSync(testFilePath, test.icontent as string);
  ////
  // go
  const argv: yargs.Argv = tendr(test.input);
  // assert
  // command
  // @ts-expect-error: Property '_' does not exist on type '{ [x: string]: unknown; format: string; "list-format": string; listFormat: string; "no-prefix": boolean; noPrefix: boolean; _: (string | number)[]; $0: string; } | Promise<{ [x: string]: unknown; format: string; "list-format": string; ... 4 more ...; $0: string; }>'.\nProperty '_' does not exist on type 'Promise<{ [x: string]: unknown; format: string; "list-format": string; listFormat: string; "no-prefix": boolean; noPrefix: boolean; _: (string | number)[]; $0: string; }>'.ts(2339)
  assert.deepStrictEqual(argv.argv._, test.cmd);
  // arguments
  if (test.args) {
    for (const key of Object.keys(test.args)) {
      assert.strictEqual(Object.keys(argv.argv).includes(key), true); // key
      // @ts-expect-error: previous test should validate keys
      assert.strictEqual(argv.argv[key], test.args[key]);             // value
    }
  }
  // options
  if (test.opts) {
    for (const key of Object.keys(test.opts)) {
      assert.strictEqual(Object.keys(argv.argv).includes(key), true); // key
      // @ts-expect-error: previous test should validate keys
      assert.strictEqual(argv.argv[key], test.opts[key]);             // value
    }
  }
  // content
  const content: string = fs.readFileSync(testFilePath, 'utf8');
  assert.strictEqual(content, test.ocontent);
};

describe('conversion', () => {

  beforeEach(() => {
    // fake "current working directory"
    process.cwd = () => path.join(cwd, 'fixtures');
    testFilePath = path.join(testCwd, 'conv.md');
    if (!fs.existsSync(testCwd)) {
      // populate test files
      fs.mkdirSync(testCwd);
    }
    // fake 'process.cwd()'
    fakeProcessCwd = sinon.spy(process, 'cwd');
  });

  afterEach(() => {
    fakeProcessCwd.restore();
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

    describe('wiki -> mkdn', () => {

      it('empty', testConv({
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

        it('single', testConv({
          icontent: ':attrtype:: [[fname-a]]\n',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: ':attrtype:: [fname-a](/fname-a)\n',
        }));

        it('list; comma', testConv({
          icontent: ':attrtype:: [[fname-a]], [[fname-b]]\n',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: ':attrtype:: [fname-a](/fname-a), [fname-b](/fname-b)\n',
        }));

        it.skip('list; comma; preserve whitespace', testConv({
          icontent: ':attrtype::[[fname-a]] ,  [[fname-b]]\n',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: ':attrtype::[fname-a](/fname-a) ,  [fname-b](/fname-b)\n',
        }));

        it('list; mkdn', testConv({
          icontent: ':attrtype::\n- [[fname-a]]\n- [[fname-b]]\n',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: ':attrtype::\n- [fname-a](/fname-a)\n- [fname-b](/fname-b)\n',
        }));

      });

      describe('link', () => {

        it('filename format', testConv({
          icontent: 'here is a link: [[fname-a]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: 'here is a link: [fname-a](/fname-a)',
        }));

        it('filename format; slugify', testConv({
          icontent: 'here is a link: [[FName A]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: 'here is a link: [FName A](/fname-a)',
        }));

        it('label', testConv({
          icontent: 'here is a link: [[fname-a|label]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: 'here is a link: [label](/fname-a)',
        }));

        it('zombie (defaults to filename format)', testConv({
          icontent: 'here is a link: [[zombie]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
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

          it('relative path format', testConv({
            icontent: 'here is a link: [[fname-a]]',
            input: ['wikitomkdn', '-F', 'relative'],
            cmd: ['wikitomkdn'],
            ocontent: 'here is a link: [fname-a](/fixtures/fname-a)',
          }));

          it('absolute path format', testConv({
            icontent: 'here is a link: [[fname-a]]',
            input: ['wikitomkdn', '-F', 'absolute'],
            cmd: ['wikitomkdn'],
            ocontent: 'here is a link: [fname-a](/test/fixtures/fname-a)',
          }));

        });

      });

      describe('embed', () => {

        it('markdown', testConv({
          icontent: 'here is an embed: ![[fname-a]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: 'here is an embed: [fname-a](/fname-a)',
        }));

        it('image', testConv({
          icontent: '![[img.png]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: '![](/img.png)',
        }));

        it.skip('audio', testConv({
          icontent: '![[aud.mp3]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: '![](/aud.mp3)',
        }));

        it.skip('video', testConv({
          icontent: '![[vid.mp4]]',
          input: ['wikitomkdn'],
          cmd: ['wikitomkdn'],
          ocontent: '![](/vid.mp4)',
        }));

      });

    });

    describe('mkdn -> wiki', () => {

      it('empty', testConv({
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

        it('single', testConv({
          icontent: ':attrtype:: [fname-a](/fname-a)\n',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: ':attrtype:: [[fname-a]]\n',
        }));

        it('list; comma', testConv({
          icontent: ':attrtype:: [fname-a](/fname-a), [fname-b](/fname-b)\n',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: ':attrtype:: [[fname-a]], [[fname-b]]\n',
        }));

        it.skip('list; comma; preserve whitespace', testConv({
          icontent: ':attrtype::[fname-a](/fname-a) ,  [fname-b](/fname-b)\n',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: ':attrtype::[[fname-a]] ,  [[fname-b]]\n',
        }));

        it('list; mkdn', testConv({
          icontent: ':attrtype::\n- [fname-a](/fname-a)\n- [fname-b](/fname-b)\n',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: ':attrtype::\n- [[fname-a]]\n- [[fname-b]]\n',
        }));

      });

      describe('link', () => {

        it('filename format', testConv({
          icontent: 'here is a link: [fname-a](/fname-a)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: 'here is a link: [[fname-a]]',
        }));

        it.skip('filename format; unslugify', testConv({
          icontent: 'here is a link: [fname-a](/fname-a)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: 'here is a link: [[FName A]]',
        }));

        it('label', testConv({
          icontent: '[label](/fname-a)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: '[[fname-a|label]]',
        }));

        it('zombie (defaults to filename format)', testConv({
          icontent: 'here is a link: [zombie](/zombie)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
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

          it('relative path format', testConv({
            icontent: 'here is a link: [fname-a](/fixtures/fname-a)',
            input: ['mkdntowiki', '-F', 'relative'],
            cmd: ['mkdntowiki'],
            ocontent: 'here is a link: [[fname-a]]',
          }));

          it('absolute path format', testConv({
            icontent: 'here is a link: [fname-a](/test/fixtures/fname-a)',
            input: ['mkdntowiki', '-F', 'absolute'],
            cmd: ['mkdntowiki'],
            ocontent: 'here is a link: [[fname-a]]',
          }));

        });

      });

      describe('embed', () => {

        it.skip('markdown', testConv({
          icontent: '![](/fname-a)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: '![[fname-a]]',
        }));

        it('image', testConv({
          icontent: '![](/img.png)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: '![[img.png]]',
        }));

        it.skip('audio', testConv({
          icontent: '![](/aud.mp3)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: '![[aud.mp3]]',
        }));

        it.skip('video', testConv({
          icontent: '![](/vid.mp4)',
          input: ['mkdntowiki'],
          cmd: ['mkdntowiki'],
          ocontent: '![[vid.mp4]]',
        }));

      });

    });

  });

  describe('aml', () => {

    describe('yaml -> caml', () => {

      it('empty', testConv({
        icontent: 'no yaml here!',
        input: ['yamltocaml'],
        cmd: ['yamltocaml'],
        ocontent: 'no yaml here!',
      }));

      describe('single', () => {

        it('null', testConv({
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

        it('bool', testConv({
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

        it('int', testConv({
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

        it('float', testConv({
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

        it('string', testConv({
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

        it('string; quotes (double)', testConv({
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

        it('time', testConv({
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

      it('leave nested objects in yaml format', testConv({
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

      it('empty', testConv({
        icontent: 'no caml here!',
        input: ['camltoyaml'],
        cmd: ['camltoyaml'],
        ocontent: 'no caml here!',
      }));

      describe('single', () => {

        it('null', testConv({
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

        it('bool', testConv({
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

        it('int', testConv({
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

        it('float', testConv({
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

        it('string', testConv({
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

        it('string; quotes (double)', testConv({
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

        it('time', testConv({
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
