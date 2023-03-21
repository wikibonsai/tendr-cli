import assert from 'node:assert/strict';
import sinon from 'sinon';

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';

import type { CommandTestCase } from './types';
import { tendr } from '../src/lib/tendr';


let fakeProcessCwd: any;
const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');
let testFilePath: string;

const testAmlConv = (test: CommandTestCase) => () => {
  // setup
  fs.writeFileSync(testFilePath, test.icontent as string);
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
  if (test.opts) {
    // options
    for (const key of Object.keys(test.opts)) {
      assert.strictEqual(Object.keys(argv.argv).includes(key), true); // key
      // @ts-expect-error: previous test should validate keys
      assert.strictEqual(argv.argv[key], test.opts[key]);             // value
    }
  }
  const content: string = fs.readFileSync(testFilePath, 'utf8');
  assert.strictEqual(content, test.ocontent);
};

describe('aml (conversion)', () => {

  beforeEach(() => {
    // fake "current working directory"
    process.cwd = () => path.join(cwd, 'fixtures');
    testFilePath = path.join(testCwd, 'attrs.md');
    if (!fs.existsSync(testCwd)) {
      // populate test files
      fs.mkdirSync(testCwd);
    }
    // fake 'process.cwd()'
    fakeProcessCwd = sinon.spy(process, 'cwd');
  });

  afterEach(() => {
    // fs.rmSync(testCwd, { recursive: true });
    fakeProcessCwd.restore();
  });

  describe('yaml -> caml', () => {

    describe('single', () => {

      it('null', testAmlConv({
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

      it('bool', testAmlConv({
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

      it('int', testAmlConv({
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

      it('float', testAmlConv({
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

      it('string', testAmlConv({
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

      it('string; quotes (double)', testAmlConv({
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

      it('time', testAmlConv({
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

    it('leave nested objects in yaml format', testAmlConv({
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

    describe('single', () => {

      it('null', testAmlConv({
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

      it('bool', testAmlConv({
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

      it('int', testAmlConv({
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

      it('float', testAmlConv({
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

      it('string', testAmlConv({
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

      it('string; quotes (double)', testAmlConv({
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

      it('time', testAmlConv({
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
