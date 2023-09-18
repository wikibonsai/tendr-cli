import assert from 'node:assert/strict';

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import yargs from 'yargs';

import type { CommandTestCase, TestMocks } from './types';
import { tendr } from '../src/tendr';
import { MD } from '../src/util/const';
import * as prompt from '../src/util/prompt';


const DEBUG: boolean = false;

export const runCmdTest = async (
  mocks: TestMocks,
  test: CommandTestCase,
  showRes: boolean = false,
): Promise<void> => {
  if (DEBUG) {
    console.debug('=== entering async runner ===');
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
      console.debug(`are you sure you want to ${action}? [y/n]\n`);
      return test.aborted ? false : true;
    },
  };
  if (mocks.testFilePath && test.icontent) {
    await fs.promises.writeFile(mocks.testFilePath, test.icontent as string);
  }
  // go //
  if (DEBUG) {
    console.debug('=== go ===');
  }
  const argv: yargs.Argv = tendr(test.input, stubPrompt);
  if (DEBUG) {
    console.debug('"argv" processed');
  }
  // grab output from 'argv.argv' so command isn't called multiple times.
  const res: any = await argv.argv;
  if (DEBUG) {
    console.debug('"argv" copied: ', res);
  }
  // assert //
  // command
  assert.deepStrictEqual(res._, test.cmd);
  // arguments
  if (test.args) {
    for (const key of Object.keys(test.args)) {
      assert.strictEqual(Object.keys(res).includes(key), true); // key
      assert.strictEqual(res[key], test.args[key]);             // value
    }
  }
  // options
  if (test.opts) {
    for (const key of Object.keys(test.opts)) {
      assert.strictEqual(Object.keys(res).includes(key), true); // key
      assert.strictEqual(res[key], test.opts[key]);             // value
    }
  }
  // confirmation prompt
  // these console log assertions are triggered in 'stubConfirm' above
  if (test.confirm) {
    const actlPrompt: string = mocks.fakeConsoleLog.getCall(0).args[0];
    assert.strictEqual(actlPrompt, test.confirm);
  }
  // aborted
  if (test.aborted) {
    const actlPrompt: string = mocks.fakeConsoleLog.getCall(1).args[0];
    assert.strictEqual(actlPrompt, prompt.PROMPT_ABORT);
  // executed
  } else {
    // console output
    if (test.output) {
      // if a confirmation prompt was displayed, output will be at index 1
      const callNo: number = test.confirm ? 1 : 0;
      actlOutput = mocks.fakeConsoleLog.getCall(callNo).args[0];
      assert.strictEqual(actlOutput, test.output);
    }
    // console warn
    if (test.warn) {
      actlWarn = mocks.fakeConsoleWarn.getCall(0).args[0];
      assert.strictEqual(actlWarn, test.warn);
    } else {
      if (mocks.fakeConsoleWarn?.called) {
        console.debug(chalk.red('unexpected console warning: ', mocks.fakeConsoleWarn.getCall(0).args[0]));
        assert.fail();
      }
    }
    // console error
    if (test.error) {
      actlError = mocks.fakeConsoleError.getCall(0).args[0];
      assert.strictEqual(actlError, test.error);
    } else {
      if (mocks.fakeConsoleError?.called) {
        console.debug(chalk.red('unexpected console error: ', mocks.fakeConsoleError.getCall(0).args[0]));
        assert.fail();
      }
    }
    // file changes
    if (test.contents) {
      if (!test.contents) { assert.fail(); }
      for (const fname of Object.keys(test.contents)) {
        const expdContent: string = test.contents[fname];
        const testFilePath: string = path.join(mocks.testCwd, fname + MD);
        if (!await fs.promises.stat(testFilePath)) {
          console.debug(`could not find file at: ${testFilePath}`);
          assert.fail();
        }
        const actlContent: string = await fs.promises.readFile(testFilePath, 'utf8');
        assert.strictEqual(expdContent, actlContent);
      }
    }
    // file content changes
    if (mocks.testFilePath && test.ocontent) {
      const content: string = await fs.promises.readFile(mocks.testFilePath, 'utf8');
      assert.strictEqual(content, test.ocontent);
    }
  }
  if (DEBUG) {
    console.debug('=== show results ===');
  }
  if (showRes) {
    if (actlOutput) {
      console.debug('Output Result:\n' + actlOutput);
    }
    if (actlWarn) {
      console.debug('Warn Result:\n' + actlWarn);
    }
    if (actlError) {
      console.debug('Error Result:\n' + actlError);
    }
  }
  // done();
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
  // command
  assert.deepStrictEqual(res._, test.cmd);
  if (DEBUG) {
    console.debug('test content: ', test);
  }
  // arguments
  if (test.args) {
    for (const key of Object.keys(test.args)) {
      assert.strictEqual(Object.keys(res).includes(key), true); // key
      assert.strictEqual(res[key], test.args[key]);             // value
    }
  }
  // options
  if (test.opts) {
    for (const key of Object.keys(test.opts)) {
      assert.strictEqual(Object.keys(res).includes(key), true); // key
      assert.strictEqual(res[key], test.opts[key]);             // value
    }
  }
  // confirmation prompt
  // these console log assertions are triggered in 'stubConfirm' above
  if (test.confirm) {
    const actlPrompt: string = mocks.fakeConsoleLog.getCall(0).args[0];
    assert.strictEqual(actlPrompt, test.confirm);
  }
  // aborted
  if (test.aborted) {
    const actlPrompt: string = mocks.fakeConsoleLog.getCall(1).args[0];
    assert.strictEqual(actlPrompt, prompt.PROMPT_ABORT);
  // executed
  } else {
    // console output
    if (test.output) {
      // if a confirmation prompt was displayed, output will be at index 1
      const callNo: number = test.confirm ? 1 : 0;
      actlOutput = mocks.fakeConsoleLog.getCall(callNo).args[0];
      assert.strictEqual(actlOutput, test.output);
    }
    // console warn
    if (test.warn) {
      actlWarn = mocks.fakeConsoleWarn.getCall(0).args[0];
      assert.strictEqual(actlWarn, test.warn);
    } else {
      if (mocks.fakeConsoleWarn?.called) {
        console.info(chalk.red('unexpected console warning: ', mocks.fakeConsoleWarn.getCall(0).args[0]));
        assert.fail();
      }
    }
    // console error
    if (test.error) {
      actlError = mocks.fakeConsoleError.getCall(0).args[0];
      assert.strictEqual(actlError, test.error);
    } else {
      if (mocks.fakeConsoleError?.called) {
        console.info(chalk.red('unexpected console error: ', mocks.fakeConsoleError.getCall(0).args[0]));
        assert.fail();
      }
    }
    // file changes
    if (test.contents) {
      if (!test.contents) { assert.fail(); }
      for (const fname of Object.keys(test.contents)) {
        const expdContent: string = test.contents[fname];
        const testFilePath: string = path.join(mocks.testCwd, fname + MD);
        if (!fs.existsSync(testFilePath)) {
          console.info(`could not find file at: ${testFilePath}`);
          assert.fail();
        }
        const actlContent: string = fs.readFileSync(testFilePath, 'utf8');
        assert.strictEqual(expdContent, actlContent);
      }
    }
    // file content changes
    if (mocks.testFilePath && test.ocontent) {
      const content: string = fs.readFileSync(mocks.testFilePath, 'utf8');
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
