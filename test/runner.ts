import assert from 'node:assert/strict';

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import yargs from 'yargs';

import type { CommandTestCase, TestMocks } from './types';
import { tendr } from '../src/tendr';
import { MD } from '../src/util/const';
import * as prompt from '../src/util/prompt';
import { ls } from '../src/util/util';


const DEBUG: boolean = false;


export const runCmdTest = (
  mocks: TestMocks,
  test: CommandTestCase,
  showRes: boolean = false,
) => async () => {
  if (DEBUG) {
    console.debug('=== entering async runner ===');
    console.debug('for test: ', test);
  }
  // setup //
  let actlOutput: string | undefined;
  let actlError: string | undefined;
  let actlWarn: string | undefined;
  const stubPrompt: any = {
    abort: () => prompt.abort(),
    confirm: (action: string) => {
      console.log(`are you sure you want to ${action}? [y/n]\n`);
      return test.aborted ? false : true;
    },
  };
  if (mocks.testFilePath && test.icontent) {
    fs.writeFileSync(mocks.testFilePath, test.icontent as string);
  }
  // go — use .parse() to await async handlers //
  const argv: yargs.Argv = tendr(test.input, stubPrompt);
  const res: any = await argv.parse();
  // assert //
  // command
  assert.deepStrictEqual(res._, test.cmd);
  // arguments
  if (test.args) {
    for (const key of Object.keys(test.args)) {
      assert.strictEqual(Object.keys(res).includes(key), true);
      assert.strictEqual(res[key], test.args[key]);
    }
  }
  // options
  if (test.opts) {
    for (const key of Object.keys(test.opts)) {
      assert.strictEqual(Object.keys(res).includes(key), true);
      assert.strictEqual(res[key], test.opts[key]);
    }
  }
  // confirmation prompt
  if (test.confirm) {
    const logCall = mocks.fakeConsoleLog.getCall(0);
    if (logCall) {
      const actlPrompt: string = logCall.args[0];
      assert.strictEqual(actlPrompt, test.confirm);
    } else {
      assert.fail('Expected confirmation prompt not found');
    }
  }
  // aborted
  if (test.aborted) {
    const logCall = mocks.fakeConsoleLog.getCall(1);
    if (logCall) {
      const actlPrompt: string = logCall.args[0];
      assert.strictEqual(actlPrompt, prompt.PROMPT_ABORT);
    } else {
      assert.fail('Expected abort prompt not found');
    }
  } else {
    // console output
    if (test.output) {
      const callNo: number = test.confirm ? 1 : 0;
      const logCall = mocks.fakeConsoleLog.getCall(callNo);
      if (logCall) {
        actlOutput = logCall.args[0];
        assert.strictEqual(actlOutput, test.output);
      } else {
        assert.fail('Expected output not found');
      }
    }
    // console warn
    if (test.warn) {
      const warnCall = mocks.fakeConsoleWarn.getCall(0);
      if (warnCall) {
        actlWarn = warnCall.args[0];
        assert.strictEqual(actlWarn, test.warn);
      } else {
        assert.fail('Expected warning not found');
      }
    } else {
      if (mocks.fakeConsoleWarn?.called) {
        const warnCall = mocks.fakeConsoleWarn.getCall(0);
        if (warnCall) {
          console.debug(chalk.red('unexpected console warning: ', warnCall.args[0]));
        }
        assert.fail();
      }
    }
    // console error
    if (test.error) {
      const errorCall = mocks.fakeConsoleError.getCall(0);
      if (errorCall) {
        actlError = errorCall.args[0];
        assert.ok(actlError!.includes(test.error),
          `Expected error to include "${test.error}", got: "${actlError}"`);
      } else {
        assert.fail('Expected error not found');
      }
    } else {
      if (mocks.fakeConsoleError?.called) {
        const errorCall = mocks.fakeConsoleError.getCall(0);
        if (errorCall) {
          console.debug(chalk.red('unexpected console error: ', errorCall.args[0]));
        }
        assert.fail();
      }
    }
    // logIncludes — assert console.log calls by index contain text
    if (test.logIncludes) {
      for (const { index, text } of test.logIncludes) {
        const logCall = mocks.fakeConsoleLog.getCall(index);
        assert.ok(logCall, `Expected console.log call at index ${index}`);
        assert.ok(logCall.args[0].includes(text),
          `Expected console.log[${index}] to include "${text}", got: "${logCall.args[0]}"`);
      }
    }
    // logLastIncludes — assert last console.log call includes text
    if (test.logLastIncludes) {
      const lastLog: string = mocks.fakeConsoleLog.getCall(mocks.fakeConsoleLog.callCount - 1).args[0];
      assert.ok(lastLog.includes(test.logLastIncludes),
        `Expected last console.log to include "${test.logLastIncludes}", got: "${lastLog}"`);
    }
    // writeFile — assert fs.writeFileSync was called with expected filename and content
    if (test.writeFile && mocks.fakeWriteFile) {
      assert.ok(mocks.fakeWriteFile.called, 'Expected fs.writeFileSync to be called');
      const writeCall = mocks.fakeWriteFile.getCall(0);
      assert.strictEqual(writeCall.args[0], test.writeFile.filename);
      assert.strictEqual(writeCall.args[1], test.writeFile.content);
    }
    // writeFileExcludes — strings that must NOT be in file content
    if (test.writeFileExcludes && mocks.fakeWriteFile) {
      const fileContent: string = mocks.fakeWriteFile.getCall(0).args[1];
      for (const excluded of test.writeFileExcludes) {
        assert.ok(!fileContent.includes(excluded),
          `File content should NOT include "${excluded}"`);
      }
    }
    // file changes
    if (test.contents) {
      for (const fname of Object.keys(test.contents)) {
        const expdContent: string = test.contents[fname];
        const testFilePath: string = path.join(mocks.testCwd, fname + MD);
        if (!fs.existsSync(testFilePath)) {
          console.debug(`could not find file at: ${testFilePath}`);
          console.debug(chalk.red('LS CONTENTS:'), ls(mocks.testCwd));
          assert.fail();
        }
        const actlContent: string = fs.readFileSync(testFilePath, 'utf8');
        assert.strictEqual(expdContent, actlContent);
      }
    }
    // file content changes
    if (mocks.testFilePath && test.ocontent) {
      const content = fs.readFileSync(mocks.testFilePath, 'utf8');
      assert.strictEqual(content, test.ocontent);
    }
  }
  if (showRes) {
    if (actlOutput) {
      console.info('Output Result:\n' + actlOutput);
    }
    if (actlWarn) {
      console.info('Warn Result:\n' + actlWarn);
    }
    if (actlError) {
      console.info('Error Result:\n' + actlError);
    }
  }
};

export const runCmdTestSync = (
  mocks: TestMocks,
  test: CommandTestCase,
  showRes: boolean = false,
) => () => {
  if (DEBUG) {
    console.debug('=== entering sync runner ===');
    console.debug('for test: ', test);
  }
  if (DEBUG) {
    console.debug('=== setup ===');
  }
  // setup //
  let actlOutput: string | undefined;
  let actlError: string | undefined;
  let actlWarn: string | undefined;
  // stubbing 'confirm.action()' from 'src/util/confirm.ts'
  const stubPrompt: any = {
    abort: () => prompt.abort(),
    // explicitly redefine 'confirm' so wwe don't need to mock 'readlineSync'
    confirm: (action: string) => {
      // this log text should match the text in 'confirm.ts'
      console.log(`are you sure you want to ${action}? [y/n]\n`);
      return test.aborted ? false : true;
    },
  };
  if (mocks.testFilePath && test.icontent) {
    fs.writeFileSync(mocks.testFilePath, test.icontent as string);
  }
  // go //
  if (DEBUG) {
    console.debug('=== go ===');
  }
  const argv: yargs.Argv = tendr(test.input, stubPrompt);
  // grab output from 'argv.argv' so command isn't called multiple times.
  const res: any = argv.argv;
  // assert //
  if (DEBUG) {
    console.debug('general: ', res, test);
  }
  // command
  assert.deepStrictEqual(res._, test.cmd);
  if (DEBUG) {
    console.debug('test content: ', test);
  }
  // arguments
  if (test.args) {
    if (DEBUG) {
      console.debug('test.args: ', test.args);
    }
    for (const key of Object.keys(test.args)) {
      assert.strictEqual(Object.keys(res).includes(key), true); // key
      assert.strictEqual(res[key], test.args[key]);             // value
    }
  }
  // options
  if (test.opts) {
    if (DEBUG) {
      console.debug('test.opts: ', test.opts);
    }
    for (const key of Object.keys(test.opts)) {
      assert.strictEqual(Object.keys(res).includes(key), true); // key
      assert.strictEqual(res[key], test.opts[key]);             // value
    }
  }
  // confirmation prompt
  // these console log assertions are triggered in 'stubConfirm' above
  if (test.confirm) {
    if (DEBUG) {
      console.debug('test.confirm: ', test.confirm);
    }
    const logCall = mocks.fakeConsoleLog.getCall(0);
    if (logCall) {
      const actlPrompt: string = logCall.args[0];
      assert.strictEqual(actlPrompt, test.confirm);
    } else {
      console.debug(chalk.red('Confirmation prompt not found in mocks.fakeConsoleLog'));
      assert.fail('Expected confirmation prompt not found');
    }
  }
  // aborted
  if (test.aborted) {
    if (DEBUG) {
      console.debug('test.aborted: ', test.aborted);
    }
    const logCall = mocks.fakeConsoleLog.getCall(1);
    if (logCall) {
      const actlPrompt: string = logCall.args[0];
      assert.strictEqual(actlPrompt, prompt.PROMPT_ABORT);
    } else {
      console.debug(chalk.red('Abort prompt not found in mocks.fakeConsoleLog'));
      assert.fail('Expected abort prompt not found');
    }
  // executed
  } else {
    // console output
    if (test.output) {
      if (DEBUG) {
        console.debug('test.output: ', test.output);
      }
      // if a confirmation prompt was displayed, output will be at index 1
      const callNo: number = test.confirm ? 1 : 0;
      const logCall = mocks.fakeConsoleLog.getCall(callNo);
      if (logCall) {
        actlOutput = logCall.args[0];
        assert.strictEqual(actlOutput, test.output);
      } else {
        console.debug(chalk.red('Output not found in mocks.fakeConsoleLog'));
        assert.fail('Expected output not found');
      }
    }
    // console warn
    if (test.warn) {
      if (DEBUG) {
        console.debug('test.warn: ', test.warn);
      }
      const warnCall = mocks.fakeConsoleWarn.getCall(0);
      if (warnCall) {
        actlWarn = warnCall.args[0];
        assert.strictEqual(actlWarn, test.warn);
      } else {
        console.debug(chalk.red('Warning not found in mocks.fakeConsoleWarn'));
        assert.fail('Expected warning not found');
      }
    } else {
      if (mocks.fakeConsoleWarn?.called) {
        if (DEBUG) {
          console.debug('mocks.fakeConsoleWarn: ', mocks.fakeConsoleWarn);
        }
        const warnCall = mocks.fakeConsoleWarn.getCall(0);
        if (warnCall) {
          console.debug(chalk.red('unexpected console warning: ', warnCall.args[0]));
        } else {
          console.debug(chalk.red('unexpected console warning'));
        }
        assert.fail();
      }
    }
    // console error
    if (test.error) {
      if (DEBUG) {
        console.debug('test.error: ', test.error);
      }
      const errorCall = mocks.fakeConsoleError.getCall(0);
      if (errorCall) {
        actlError = errorCall.args[0];
        assert.strictEqual(actlError, test.error);
      } else {
        console.debug(chalk.red('Error not found in mocks.fakeConsoleError'));
        assert.fail('Expected error not found');
      }
    } else {
      if (mocks.fakeConsoleError?.called) {
        if (DEBUG) {
          console.debug('mocks.fakeConsoleError: ', mocks.fakeConsoleError);
        }
        const errorCall = mocks.fakeConsoleError.getCall(0);
        if (errorCall) {
          console.debug(chalk.red('unexpected console error: ', errorCall.args[0]));
        } else {
          console.debug(chalk.red('unexpected console error'));
        }
        assert.fail();
      }
    }
    // file changes
    if (test.contents) {
      if (DEBUG) {
        console.debug('test.contents: ', test.contents);
      }
      if (!test.contents) { assert.fail(); }
      for (const fname of Object.keys(test.contents)) {
        const expdContent: string = test.contents[fname];
        const testFilePath: string = path.join(mocks.testCwd, fname + MD);
        if (!fs.existsSync(testFilePath)) {
          console.debug(`could not find file at: ${testFilePath}`);
          console.debug(chalk.red('LS CONTENTS:'), ls(mocks.testCwd));
          assert.fail();
        }
        const actlContent: string = fs.readFileSync(testFilePath, 'utf8');
        assert.strictEqual(expdContent, actlContent);
      }
    }
    // file content changes
    if (mocks.testFilePath && test.ocontent) {
      if (DEBUG) {
        console.debug('test.ocontent: ', test.ocontent);
      }
      const content = fs.readFileSync(mocks.testFilePath, 'utf8');
      assert.strictEqual(content, test.ocontent);
    }
  }
  if (DEBUG) {
    console.debug('=== show results ===');
  }
  if (showRes) {
    if (actlOutput) {
      console.info('Output Result:\n' + actlOutput);
    }
    if (actlWarn) {
      console.info('Warn Result:\n' + actlWarn);
    }
    if (actlError) {
      console.info('Error Result:\n' + actlError);
    }
  }
};
