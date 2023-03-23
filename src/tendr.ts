import type { ArgumentsCamelCase } from 'yargs';
import yargs from 'yargs';

import fs from 'fs';
import path from 'path';

import { camlToYaml, yamlToCaml } from './cmds/aml';
import { list } from './cmds/list';
import { rename } from './cmds/rename';
import { retype } from './cmds/retype';

// waiting on: https://github.com/tc39/proposal-import-assertions
// import pkg from '../package.json' assert { type: 'json' };

// helper to extract package.json values
function getPkgObj(env: string = 'dev') {
  const envCases: any = {
    test: '../package.json',
    dev: '../package.json',
    prod: './package.json',
  };
  const relPkgPath: string = envCases[env];
  const pkgPath: string = path.resolve(path.dirname(new URL(import.meta.url).pathname), relPkgPath);
  const fileContent: string = fs.readFileSync(pkgPath, 'utf-8').toString();
  return JSON.parse(fileContent);
}

// from: https://en.wikipedia.org/wiki/Command-line_interface#Command_description_syntax
// <> required
// [] optional
// ... list
// | or

export const tendr = (argv: string[], env: string = 'dev'): yargs.Argv => {
  const pkg: any = getPkgObj(env);
  return yargs(argv)
    .scriptName('tendr')
    .alias('tend', 't')
    .version(pkg.version)
    .usage('usage: $0 <command>\n\ncli tools for markdown-based digital gardening.')
    .demandCommand(1, 'please provide a valid command.')
    .help()
    // .wrap(null)
    // .epilogue('cli tools for markdown-based digital gardening')

    .command({
      command: 'list <filename>',
      aliases: ['ls'],
      describe: 'list all references for a given file',
      builder: (yargs: yargs.Argv) => yargs
        .option('kind', {
          alias: 'k',
          type: 'string',
          describe: 'kind of references to list\n(kinds: "ref", "foreref", "backref", "attr", "foreattr", "backattr", "link", "forelink", "backlink"; default is "ref")',
          default: 'ref',
        }),
      handler: (argv: ArgumentsCamelCase) =>
        list(argv.filename as string, argv),
    })

    .command({
      command: 'rename <old-fname> <new-fname>',
      aliases: ['rn'],
      describe: 'rename a file and all of its references.',
      handler: (argv: ArgumentsCamelCase) =>
        rename(argv.oldFname as string, argv.newFname as string, argv),
    })

    .command({
      command: 'retype <old-type> <new-type>',
      aliases: ['rt'],
      describe: 'rename reference type and all its occurrences.',
      builder: (yargs: yargs.Argv) => yargs
        .option('kind', {
          alias: 'k',
          type: 'string',
          describe: 'kind of entity to rename (kinds: "reftype", "attrtype", "linktype"; default is "reftype")',
          default: 'reftype',
        }),
      handler: (argv: ArgumentsCamelCase) =>
        retype(argv.oldType as string, argv.newType as string, argv),
    })

    .command({
      command: 'camltoyaml [glob]',
      aliases: ['ctoy'],
      describe: 'convert between "caml" and "yaml" style attributes.',
      handler: (argv: ArgumentsCamelCase) =>
        camlToYaml(argv.glob as string, argv),
    })

    .command({
      command: 'yamltocaml [glob]',
      aliases: ['ytoc'],
      describe: 'convert between "caml" and "yaml" style attributes.',
      // builder: (yargs: yargs.CommandBuilder<Record<string, any>, Record<string, any>>) => yargs
      builder: (yargs: yargs.Argv) => yargs
        .option('format', {
          alias: 'f',
          type: 'string',
          describe: 'how to format caml output (kinds: "none", "pretty", or "pad"; default is "none")',
          default: 'pretty',
        })
        .option('list-format', {
          alias: 'l',
          type: 'string',
          describe: 'how to format caml output lists (kinds: "mkdn" or "comma"; default is "mkdn")',
          default: 'mkdn',
        })
        .option('no-prefix', {
          alias: 'p',
          type: 'boolean',
          describe: 'do not use colon prefix in caml output',
          default: true,
        }),
      handler: (argv: ArgumentsCamelCase) =>
        yamlToCaml(argv.glob as string, argv),
    });
};
