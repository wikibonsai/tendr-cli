import fs from 'fs';
import path from 'path';

import type { ArgumentsCamelCase } from 'yargs';
import yargs from 'yargs';

import { SemTree } from 'semtree';

import { CONFIG_PATH, DOCTYPE_PATH } from './util/const';
import type { InitTree } from './util/tree';
import { buildTree } from './util/tree';

import { camlToYaml, yamlToCaml } from './cmds/aml';
import { REL_KINDS, status } from './cmds/status';
import { rename } from './cmds/rename';
import { retype } from './cmds/retype';
import { tree } from './cmds/tree';


// waiting on: https://github.com/tc39/proposal-import-assertions
// import pkg from '../package.json' assert { type: 'json' };

// helper to extract package.json values
export function getPkgObj() {
  const relPkgPath: string = '../package.json';
  const pkgPath: string = path.resolve(path.dirname(new URL(import.meta.url).pathname), relPkgPath);
  const fileContent: string = fs.readFileSync(pkgPath, 'utf-8').toString();
  return JSON.parse(fileContent);
}

// from: https://en.wikipedia.org/wiki/Command-line_interface#Command_description_syntax
// <> required
// [] optional
// ... list
// | or

export const tendr = (argv: string[]): yargs.Argv => {
  const pkg: any = getPkgObj();
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
      command: 'tree',
      // aliases: [''],
      describe: 'print full knowledge bonsai',
      builder: (yargs: yargs.Argv) => yargs
        .option('config', {
          alias: 'c',
          type: 'string',
          describe: 'relative path to config file, including filename; defaults to "./config.toml"',
          default: CONFIG_PATH,
        })
        .option('doctype', {
          alias: 'd',
          type: 'string',
          describe: 'relative path to doctype file, including filename; defaults to "t.doc.toml"',
          default: DOCTYPE_PATH,
        })
        .option('root', {
          alias: 'r',
          type: 'string',
          describe: 'filename for root of tree',
        })
        .option('glob', {
          alias: 'g',
          type: 'string',
          describe: 'glob to index files',
        }),
      handler: (argv: ArgumentsCamelCase) => {
        const payload: InitTree = {
          configUri: argv.config as string,
          doctypeUri: argv.doctype as string,
          rootFileName: argv.root as string | undefined,
          globIndexUris: argv.glob as string | undefined
        };
        const semtree: SemTree | undefined = buildTree(payload);
        if (semtree instanceof SemTree) {
          tree(semtree, argv);
        }
      },
    })

    .command({
      command: 'status <filename>',
      aliases: ['stat'],
      describe: 'show status of file relationships',
      builder: (yargs: yargs.Argv) => yargs
        .option('kind', {
          alias: 'k',
          type: 'string',
          describe: `kind of relationships to list\n(kinds: ${REL_KINDS.join(', ')}; default is "rel")`,
          default: 'rel',
        }),
      handler: (argv: ArgumentsCamelCase) => {
        const payload: InitTree = {
          configUri: argv.config as string,
          doctypeUri: argv.doctype as string,
          rootFileName: argv.root as string | undefined,
          globIndexUris: argv.glob as string | undefined
        };
        const semtree: SemTree | undefined = buildTree(payload);
        if (semtree instanceof SemTree) {
          status(argv.filename as string, semtree, argv);
        }
      }
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
      describe: 'convert from "caml" to "yaml" style attributes.',
      handler: (argv: ArgumentsCamelCase) =>
        camlToYaml(argv.glob as string, argv),
    })

    .command({
      command: 'yamltocaml [glob]',
      aliases: ['ytoc'],
      describe: 'convert from "yaml" to "caml" style attributes.',
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
