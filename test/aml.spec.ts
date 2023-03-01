import assert from 'node:assert/strict';
import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import { tendr } from '../src/lib/tendr';


interface CommandTestCase {
  content: string,
  cmd: string[],
  args: string[],
  result: string,
}

let fakeProcessCwd: any;
const cwd: string = path.dirname(__dirname);
const testCwd: string = path.join(cwd, 'test', 'fixtures');
let testFilePath: string;

const testAmlConv = (test: CommandTestCase) => () => {
  fs.writeFileSync(testFilePath, test.content);
  tendr.parse(test.cmd);
  assert.deepStrictEqual(tendr.args, test.args);
  const content: string = fs.readFileSync(testFilePath, 'utf8');
  assert.strictEqual(content, test.result);
};

describe('aml (conversion)', () => {

  beforeEach(() => {
    // fake "current working directory"
    process.cwd = () => path.join(cwd, 'test', 'fixtures');
    testFilePath = path.join(testCwd, 'attrs.md');
    if (!fs.existsSync(testCwd)) {
      // populate test files
      fs.mkdirSync(testCwd);
    }
    // fake 'process.cwd()'
    fakeProcessCwd = sinon.spy(process, 'cwd');
  });

  afterEach(() => {
    fs.rmSync(testCwd, { recursive: true });
    fakeProcessCwd.restore();
  });

  describe('yaml -> caml', () => {

    describe('single', () => {

      it('null', testAmlConv({
        content:
`---
empty: null
---
`,
        cmd: ['node', 'tendr', 'yamltocaml'],
        args: ['yamltocaml'],
        result:
`: empty :: null
`,
      }));

      it('bool', testAmlConv({
        content:
`---
success: true
---
`,
        cmd: ['node', 'tendr', 'yamltocaml'],
        args: ['yamltocaml'],
        result:
`: success :: true
`,
      }));

      it('int', testAmlConv({
        content:
`---
id: 12345
---
`,
        cmd: ['node', 'tendr', 'yamltocaml'],
        args: ['yamltocaml'],
        result:
`: id :: 12345
`,
      }));

      it('float', testAmlConv({
        content:
`---
value: 12.345
---
`,
        cmd: ['node', 'tendr', 'yamltocaml'],
        args: ['yamltocaml'],
        result:
`: value :: 12.345
`,
      }));

      it('string', testAmlConv({
        content:
`---
tldr: a file that has attributes which should be converted.
---
`,
        cmd: ['node', 'tendr', 'yamltocaml'],
        args: ['yamltocaml'],
        result:
`: tldr :: a file that has attributes which should be converted.
`,
      }));

      it('string; quotes (double)', testAmlConv({
        content:
`---
tldr: "a file that has attributes, which should be converted."
---
`,
        cmd: ['node', 'tendr', 'yamltocaml'],
        args: ['yamltocaml'],
        result:
`: tldr :: a file that has attributes, which should be converted.
`,
      }));

      it.skip('string; quotes (double); generated caml string loses quotes', () => { return; });

      it('time', testAmlConv({
        content:
`---
time: 2022-11-24 20:00:00 +08:00
---
`,
        cmd: ['node', 'tendr', 'yamltocaml'],
        args: ['yamltocaml'],
        result:
`: time :: Thu Nov 24 2022 07:00:00 GMT-0500 (Eastern Standard Time)
`,
      }));

      it.skip('time; formatting', () => { return; });

    });

    describe.skip('list; comma-separated', () => { return; });
    describe.skip('list; mkdn-separated', () => { return; });

    it('leave nested objects in yaml format', testAmlConv({
      content:
`---
tldr: a file that has attributes which should be converted.
nest-1:
  nested-key: nested value.
nest-2:
  - nested-array-key-a: nested value.
    nested-array-key-b: nested value.
---
`,
      cmd: ['node', 'tendr', 'yamltocaml'],
      args: ['yamltocaml'],
      result:
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
        content:
`: empty :: null
`,
        cmd: ['node', 'tendr', 'camltoyaml'],
        args: ['camltoyaml'],
        result:
`---
empty: null
---
`,
      }));

      it('bool', testAmlConv({
        content:
`: success :: true
`,
        cmd: ['node', 'tendr', 'camltoyaml'],
        args: ['camltoyaml'],
        result:
`---
success: true
---
`,
      }));

      it('int', testAmlConv({
        content:
`: id :: 12345
`,
        cmd: ['node', 'tendr', 'camltoyaml'],
        args: ['camltoyaml'],
        result:
`---
id: 12345
---
`,
      }));

      it('float', testAmlConv({
        content:
`: value :: 12.345
`,
        cmd: ['node', 'tendr', 'camltoyaml'],
        args: ['camltoyaml'],
        result:
`---
value: 12.345
---
`,
      }));

      it('string', testAmlConv({
        content:
`: tldr  :: a file that has attributes which should be converted.
`,
        cmd: ['node', 'tendr', 'camltoyaml'],
        args: ['camltoyaml'],
        result:
`---
tldr: a file that has attributes which should be converted.
---
`,
      }));

      it('string; quotes (double)', testAmlConv({
        content:
`: tldr  :: "a file that has attributes, which should be converted."
`,
        cmd: ['node', 'tendr', 'camltoyaml'],
        args: ['camltoyaml'],
        result:
`---
tldr: '"a file that has attributes, which should be converted."'
---
`,
      }));

      it.skip('string; quotes (double); todo: generated yaml adds single quotes', () => { return; });

      it('time', testAmlConv({
        content:
`: time :: 2022-11-24 20:00:00 +08:00
`,
        cmd: ['node', 'tendr', 'camltoyaml'],
        args: ['camltoyaml'],
        result:
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
