import sinon from 'sinon';
import mockFs from 'mock-fs';

import path from 'path';

import type { TestMocks } from './types';
import { runCmdTestSync } from './runner';


const testCwd: string = '/path/to/notes';
let fakeConsoleLog: any;
let fakeConsoleWarn: any;
let fakeConsoleError: any;
let fakeProcessCwd: any;

const mocks: TestMocks = {
  fakeProcessCwd,
  fakeConsoleLog,
  fakeConsoleWarn,
  fakeConsoleError,
  testCwd,
};

describe('find', () => {

  beforeEach(() => {
    // Mock the file system
    mockFs({
      [testCwd]: {
        'fname-a.md': '',
        'fname-b.md': '',
      },
      [path.join(testCwd, 'folder')]: {
        'fname-b.md': '',
      },
    });
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
    mocks.fakeConsoleError.restore();
    mocks.fakeConsoleWarn.restore();
    mocks.fakeConsoleLog.restore();
    sinon.restore();
    mocks.fakeProcessCwd.restore();
    mockFs.restore();
  });

  describe('string', () => {

    it('no file found', runCmdTestSync(mocks, {
      input: ['find', 'fname'],
      cmd: ['find'],
      args: {},
      opts: {},
      output:
        '🍂 no files found',
    }));

    it('single file found', runCmdTestSync(mocks, {
      input: ['find', 'fname-a'],
      cmd: ['find'],
      args: {},
      opts: {},
      output:
        '/path/to/notes/fname-a.md',
    }));

    it('multi file found', runCmdTestSync(mocks, {
      input: ['find', 'fname-b'],
      cmd: ['find'],
      args: {},
      opts: {},
      output:
        '/path/to/notes/fname-b.md\n'
      + '/path/to/notes/folder/fname-b.md',
    }));

  });

  describe('regex', () => {

    it('no file found', runCmdTestSync(mocks, {
      input: ['find', '-r', 'fname$'],
      cmd: ['find'],
      args: {
        'regex': true,
      },
      opts: {},
      output:
        '🍂 no files found',
    }));

    it('single file found', runCmdTestSync(mocks, {
      input: ['find', '-r', '.*-a$'],
      cmd: ['find'],
      args: {
        'regex': true,
      },
      opts: {},
      output:
        '/path/to/notes/fname-a.md',
    }));

    it('multi file found', runCmdTestSync(mocks, {
      input: ['find', '-r', '^fname-*'],
      cmd: ['find'],
      args: {
        'regex': true,
      },
      opts: {},
      output:
        '/path/to/notes/fname-a.md\n'
      + '/path/to/notes/fname-b.md\n'
      + '/path/to/notes/folder/fname-b.md',
    }));

    it('error; invalid regex', runCmdTestSync(mocks, {
      input: ['find', '-r', '(?:hello'],
      cmd: ['find'],
      args: {
        'regex': true,
      },
      opts: {},
      error:
        '\x1B[31m"(?:hello" is not valid regex\x1B[39m',
    }));

  });

});
