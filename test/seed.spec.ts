import assert from 'node:assert/strict';
import sinon from 'sinon';

import fs from 'fs';
import path from 'path';

import type { TestMocks } from './types';
import { runCmdTest } from './runner';


const cwd: string = path.dirname(new URL(import.meta.url).pathname);
const testCwd: string = path.join(cwd, 'fixtures');
let fakeConsoleLog: any;
let fakeConsoleWarn: any;
let fakeConsoleError: any;
let fakeProcessCwd: any;
let fetchStub: sinon.SinonStub;
let savedEnvKey: string | undefined;

const mocks: TestMocks = {
  fakeProcessCwd,
  fakeConsoleLog,
  fakeConsoleWarn,
  fakeConsoleError,
  testCwd,
};


// helper: build a fake LLM API response matching the shapes germinate expects
// Includes both Anthropic and OpenAI/XAI format for universal compatibility
function fakeLlmResponse(text: string): any {
  return {
    ok: true,
    json: async () => ({
      // anthropic format
      content: [{ text }],
      // openai/xai format
      choices: [{ message: { content: text } }],
    }),
  };
}


// shared constants for realistic content tests
const SEPARATOR: string = '\n\n!!!\n\n';

const realisticResponse: string = ''
  + '[[knowledge]] > [[computer-science]] > [[ai]] > [[machine-learning]]'
  + SEPARATOR
  + ': title    :: Machine Learning\n'
  + ': alias    :: ML\n'
  + ': hypernym :: [[ai]]\n'
  + ': hyponym  ::\n'
  + '             - [[supervised-learning]]\n'
  + '             - [[unsupervised-learning]]\n'
  + '             - [[reinforcement-learning]]\n'
  + ': synonym  :: [[deep-learning]]\n'
  + ": antonym  :: ''\n"
  + ': tldr     :: "Machine learning is a branch of AI where computers use data to improve at tasks without being directly programmed."\n'
  + SEPARATOR
  + '- [[machine-learning]]\n'
  + '  - [[supervised-learning]]\n'
  + '    - [[classification]]\n'
  + '      - [[logistic-regression]]\n'
  + '    - [[regression]]\n'
  + '      - [[linear-regression]]\n'
  + '  - [[unsupervised-learning]]\n'
  + '    - [[clustering]]\n'
  + '      - [[k-means]]\n'
  + '  - [[reinforcement-learning]]\n'
  + '    - [[model-free-methods]]\n'
  + '      - [[q-learning]]\n';

const nodeContent: string = ''
  + ': title    :: Machine Learning\n'
  + ': alias    :: ML\n'
  + ': hypernym :: [[ai]]\n'
  + ': hyponym  ::\n'
  + '             - [[supervised-learning]]\n'
  + '             - [[unsupervised-learning]]\n'
  + '             - [[reinforcement-learning]]\n'
  + ': synonym  :: [[deep-learning]]\n'
  + ": antonym  :: ''\n"
  + ': tldr     :: "Machine learning is a branch of AI where computers use data to improve at tasks without being directly programmed."\n';

const treeContent: string = ''
  + '- [[machine-learning]]\n'
  + '  - [[supervised-learning]]\n'
  + '    - [[classification]]\n'
  + '      - [[logistic-regression]]\n'
  + '    - [[regression]]\n'
  + '      - [[linear-regression]]\n'
  + '  - [[unsupervised-learning]]\n'
  + '    - [[clustering]]\n'
  + '      - [[k-means]]\n'
  + '  - [[reinforcement-learning]]\n'
  + '    - [[model-free-methods]]\n'
  + '      - [[q-learning]]\n';

// ancestors (knowledge, computer-science, ai) prepended + tree re-indented by 6 spaces
const formattedTree: string = ''
  + '- [[knowledge]]\n'
  + '  - [[computer-science]]\n'
  + '    - [[ai]]\n'
  + '      - [[machine-learning]]\n'
  + '        - [[supervised-learning]]\n'
  + '          - [[classification]]\n'
  + '            - [[logistic-regression]]\n'
  + '          - [[regression]]\n'
  + '            - [[linear-regression]]\n'
  + '        - [[unsupervised-learning]]\n'
  + '          - [[clustering]]\n'
  + '            - [[k-means]]\n'
  + '        - [[reinforcement-learning]]\n'
  + '          - [[model-free-methods]]\n'
  + '            - [[q-learning]]\n';


describe('seed', () => {

  beforeEach(() => {
    // populate test dir
    if (!fs.existsSync(testCwd)) {
      fs.mkdirSync(testCwd);
    }
    // write a minimal config.toml so getConfig doesn't warn
    fs.writeFileSync('config.toml', '# empty\n');
    // save and set env key
    savedEnvKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = 'sk-test-key';
    // stub global fetch to return canned Anthropic response
    fetchStub = sinon.stub(globalThis as any, 'fetch').resolves(
      fakeLlmResponse(''),
    );
    // fake "current working directory"
    process.cwd = () => testCwd;
    fakeProcessCwd = sinon.spy(process, 'cwd');
    mocks.fakeProcessCwd = fakeProcessCwd;
    // suppress console
    console.log = (msg) => msg + '\n';
    console.warn = (msg) => msg + '\n';
    console.error = (msg) => msg + '\n';
    // fake console
    fakeConsoleLog = sinon.spy(console, 'log');
    fakeConsoleWarn = sinon.spy(console, 'warn');
    fakeConsoleError = sinon.spy(console, 'error');
    mocks.fakeConsoleLog = fakeConsoleLog;
    mocks.fakeConsoleWarn = fakeConsoleWarn;
    mocks.fakeConsoleError = fakeConsoleError;
  });

  afterEach(() => {
    if (fs.existsSync(testCwd)) {
      fs.rmSync(testCwd, { recursive: true });
    }
    if (fs.existsSync('config.toml')) {
      fs.rmSync('config.toml');
    }
    // restore env
    if (savedEnvKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = savedEnvKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
    sinon.restore();
  });

  describe('base', () => {


    it('successful; prints to stdout', () => {
      fetchStub.resolves(fakeLlmResponse('# Machine Learning\n\nSome generated content here.'));
      return runCmdTest(mocks, {
        input: ['seed', 'myconcept'],
        cmd: ['seed'],
        args: { concept: 'myconcept' },
        logIncludes: [
          { index: 0, text: '# Machine Learning\n\nSome generated content here.' },
        ],
      })();
    });

    it('prints realistic 3-part response to stdout', () => {
      fetchStub.resolves(fakeLlmResponse(realisticResponse));
      return runCmdTest(mocks, {
        input: ['seed', 'machine-learning'],
        cmd: ['seed'],
        args: { concept: 'machine-learning' },
        logIncludes: [
          { index: 0, text: ': title    :: Machine Learning' },
          { index: 0, text: '- [[knowledge]]' },
          { index: 0, text: '  - [[computer-science]]' },
          { index: 0, text: '    - [[ai]]' },
          { index: 0, text: '      - [[machine-learning]]' },
        ],
      })();
    });

    it('handles malformed separator with single newlines', () => {
      // LLM sometimes returns \n!!!\n instead of \n\n!!!\n\n
      const malformedSep = '\n!!!\n';
      const malformedResponse = ''
        + '[[knowledge]] > [[computer-science]] > [[ai]] > [[machine-learning]]'
        + malformedSep
        + nodeContent
        + malformedSep
        + treeContent;
      fetchStub.resolves(fakeLlmResponse(malformedResponse));
      return runCmdTest(mocks, {
        input: ['seed', 'machine-learning'],
        cmd: ['seed'],
        args: { concept: 'machine-learning' },
        logIncludes: [
          { index: 0, text: ': title    :: Machine Learning' },
          { index: 0, text: '- [[knowledge]]' },
          { index: 0, text: '  - [[computer-science]]' },
          { index: 0, text: '    - [[ai]]' },
          { index: 0, text: '      - [[machine-learning]]' },
        ],
      })();
    });

  });

  describe('api', () => {

    it('no api key; shows fallback error', () => {
      // temporarily unset env key so api key resolves to ''
      delete process.env.ANTHROPIC_API_KEY;
      return runCmdTest(mocks, {
        input: ['seed', 'myconcept'],
        cmd: ['seed'],
        args: { concept: 'myconcept' },
        error: 'Cannot seed without an API key',
      })();
    });

    it('api error; shows clean message without stack trace', async () => {
      fetchStub.resolves({
        ok: false,
        json: async () => ({ error: { message: 'invalid api key' } }),
      });
      return runCmdTest(mocks, {
        input: ['seed', 'myconcept'],
        cmd: ['seed'],
        args: { concept: 'myconcept' },
        error: 'Error from anthropic',
      })().then(() => {
        const errorMsg: string = fakeConsoleError.getCall(0).args[0];
        assert.ok(errorMsg.includes('invalid api key'),
          `Expected error to include "invalid api key", got: "${errorMsg}"`);
        assert.ok(!errorMsg.includes('at generate'),
          `Error should not contain stack trace, got: "${errorMsg}"`);
        assert.ok(!errorMsg.includes('at seed'),
          `Error should not contain stack trace, got: "${errorMsg}"`);
      });
    });

  });

  describe('--output', () => {

    beforeEach(() => {
      mocks.fakeWriteFile = sinon.stub(fs, 'writeFileSync');
    });

    it('writes formatted content with ancestor tree to file', () => {
      fetchStub.resolves(fakeLlmResponse(realisticResponse));
      return runCmdTest(mocks, {
        input: ['seed', 'machine-learning', '--output'],
        cmd: ['seed'],
        args: { concept: 'machine-learning' },
        writeFile: {
          filename: 'machine-learning.md',
          content: nodeContent + '\n\n' + formattedTree,
        },
        writeFileExcludes: ['[[knowledge]] > [[computer-science]] > [[ai]]'],
        logLastIncludes: 'wrote machine-learning.md',
      })();
    });

    it('successful germinate with --output; writes file', () => {
      fetchStub.resolves(fakeLlmResponse('# Machine Learning\n\nSome generated content here.'));
      return runCmdTest(mocks, {
        input: ['seed', 'myconcept', '--output'],
        cmd: ['seed'],
        args: { concept: 'myconcept' },
        writeFile: {
          filename: 'myconcept.md',
          content: '# Machine Learning\n\nSome generated content here.',
        },
      })();
    });

  });

  describe('config-based formatting', () => {

    it('picks up config-based defaults for formatting', () => {
      // write a real config.toml with format settings
      const configContent = `[format]\nattrs = "yaml"\ncase = "upper"\n`;
      fs.writeFileSync(path.join(testCwd, 'config.toml'), configContent);
      fetchStub.resolves(fakeLlmResponse(realisticResponse));
      return runCmdTest(mocks, {
        input: ['seed', 'machine-learning', '-c', path.join(testCwd, 'config.toml')],
        cmd: ['seed'],
        args: { concept: 'machine-learning' },
        logIncludes: [
          { index: 0, text: '- [[knowledge]]' },
          { index: 0, text: ': title    :: Machine Learning' },
        ],
      })();
    });

  });

});
