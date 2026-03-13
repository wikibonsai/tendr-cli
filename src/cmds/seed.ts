import fs from 'fs';

import chalk from 'chalk';
import type { ArgumentsCamelCase } from 'yargs';

import { Wisp, seed as wispSeed, formatWithAncestors, DEFAULT_MODELS, DEFAULT_MKDN } from 'wisp-ai';
import type { OptMkdn, Provider, SeedResult } from 'wisp-ai';
import { getConfig } from '../util/config';


const NO_KEY_MSG: string = `Cannot seed without an API key.

  ${chalk.yellow('--api-key')} ${chalk.dim('<key>')}    Provide a key directly
  ${chalk.yellow('--provider')} ${chalk.dim('<name>')}  Set provider (anthropic, openai, xai) ${chalk.dim('[default: anthropic]')}
  ${chalk.yellow('--model')} ${chalk.dim('<name>')}     Override model ${chalk.dim('[default: per provider]')}

Env vars also work (e.g. ANTHROPIC_API_KEY).`;

export async function seed(concept: string, argv: ArgumentsCamelCase): Promise<void> {
  // resolve provider
  const provider: string = (argv.provider as string) || 'anthropic';
  // validate provider
  const SUPPORTED_PROVIDERS = ['anthropic', 'openai', 'xai'];
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    console.error(chalk.red(`Unknown provider "${provider}". Supported: ${SUPPORTED_PROVIDERS.join(', ')}`));
    return;
  }
  // resolve api key (flag > env var)
  const apiKey: string = (argv.apiKey as string | undefined)
    || process.env[`${provider.toUpperCase()}_API_KEY`]
    || '';
  if (!apiKey) {
    console.error(chalk.red(NO_KEY_MSG));
    return;
  }
  // resolve model
  const model: string = (argv.model as string) || DEFAULT_MODELS[provider] || DEFAULT_MODELS['anthropic'];
  // resolve markdown formatting options (flag > config > defaults)
  const config: any = getConfig(argv.config as string | undefined);
  const lintConfig: any = (config && config.lint) ? config.lint : {};
  const mkdn: OptMkdn = {
    attrs:      (argv.attrs      as OptMkdn['attrs'])      || lintConfig.attrs      || DEFAULT_MKDN.attrs,
    case:       (argv.case       as OptMkdn['case'])       || lintConfig.case       || DEFAULT_MKDN.case,
    text:       (argv.text       as OptMkdn['text'])       || lintConfig.text       || DEFAULT_MKDN.text,
    indent:     (argv.indent     as OptMkdn['indent'])     || lintConfig.indent     || DEFAULT_MKDN.indent,
    whitespace: (argv.whitespace as OptMkdn['whitespace']) || lintConfig.whitespace || DEFAULT_MKDN.whitespace,
  };
  // call LLM via wisp-ai
  const wisp = new Wisp({ provider: provider as Provider, apiKey, model });
  const result: SeedResult = await wispSeed(wisp, concept, { mkdn });
  // format output
  const content: string = result.ancestors
    ? formatWithAncestors(result.ancestors, result.node + '\n', result.tree + '\n')
    : result.raw;
  // output
  if (argv.output) {
    const filename: string = concept + '.md';
    fs.writeFileSync(filename, content, 'utf8');
    console.log(chalk.green(`wrote ${filename}`));
  } else {
    console.log(content);
  }
}
