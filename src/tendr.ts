import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import type { ArgumentsCamelCase } from 'yargs';
import yargs from 'yargs';

import type { SemTree } from 'semtree';

import { CONFIG_PATH, DOCTYPE_PATH } from './util/const';
import { getDocTypes } from './util/config';
import type { InitTree } from './util/tree';
import { buildTree, buildTreeSync } from './util/tree';
import * as prompt from './util/prompt';

import { REL_KINDS, status } from './cmds/status';
import { find } from './cmds/find';
import { camlToYaml, mkdnToWiki, wikiToMkdn, yamlToCaml } from './cmds/convert';
import { lint } from './cmds/lint';
// import { list } from './cmds/list';
import { rename } from './cmds/rename';
import { retypedoc, retyperef } from './cmds/retype';
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

export const tendr = (argv: string[], p: any = prompt): yargs.Argv => {
  const pkg: any = getPkgObj();
  return yargs(argv)
    .scriptName('tendr')
    .alias('tend', 't')
    .version(pkg.version)
    .usage('usage: $0 <command>\n\ncli tools for markdown-based digital gardening.')
    .demandCommand(1, 'please provide a valid command.')
    .help()
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
    // .wrap(null)
    // .epilogue('cli tools for markdown-based digital gardening')

  // garden level

    .command({
      command: 'lint',
      // aliases: [''],
      describe: 'lint garden files',
      builder: (yargs: yargs.Argv) => yargs
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
        try {
          const payload: InitTree = {
            configUri: argv.config as string,
            doctypeUri: argv.doctype as string,
            rootFileName: argv.root as string | undefined,
            globIndexUris: argv.glob as string | undefined
          };
          lint(payload);
        } catch (e) {
          console.error(e);
        }
      },
    })

  // todo
  // .command({
  //   command: 'list',
  //   aliases: ['ls'],
  //   describe: 'list garden contents',
  //   builder: (yargs: yargs.Argv) => yargs
  //     .option('kind', {
  //       alias: 'k',
  //       type: 'string',
  //       describe: 'list information about a markdown garden',
  //       default: 'rel',
  //     }),
  //   handler: (argv: ArgumentsCamelCase) => list(),
  // })

    .command({
      command: 'tree',
      // aliases: [''],
      describe: 'print full knowledge bonsai.',
      builder: (yargs: yargs.Argv) => yargs
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
        try {
          const payload: InitTree = {
            configUri: argv.config as string,
            doctypeUri: argv.doctype as string,
            rootFileName: argv.root as string | undefined,
            globIndexUris: argv.glob as string | undefined
          };
          const semtree: SemTree | undefined = buildTreeSync(payload);
          if (semtree) {
            tree(semtree, argv);
          } else {
            console.error(chalk.red('unable to build tree'));
          }
        } catch (e) {
          console.error(e);
        }
      },
    })

  // file level

    .command({
      command: 'status <filename>',
      aliases: ['stat'],
      describe: 'show status of file relationships.',
      builder: (yargs: yargs.Argv) => yargs
        .option('kind', {
          alias: 'k',
          type: 'string',
          describe: `kind of relationships to list\n(kinds: ${REL_KINDS.join(', ')}; default is "rel")`,
          default: 'rel',
        }),
      handler: async (argv: ArgumentsCamelCase) => {
        try {
          const payload: InitTree = {
            configUri: argv.config as string,
            doctypeUri: argv.doctype as string,
            rootFileName: argv.root as string | undefined,
            globIndexUris: argv.glob as string | undefined,
          };
          const semtree: Promise<SemTree | undefined> = buildTree(payload);
          const doctypes: any[] | undefined = getDocTypes(payload.doctypeUri);
          return status(argv.filename as string, semtree, doctypes, argv);
        } catch (e) {
          console.error(e);
        }
      }
    })

    .command({
      command: 'find <fname>',
      aliases: ['f'],
      describe: 'show full path of markdown file(s) with the given filename.',
      builder: (yargs: yargs.Argv) => yargs
        .option('regex', {
          alias: 'r',
          type: 'boolean',
          describe: 'usage: find <regex>; use regex pattern instead of string -- this will find all filenames containing matches to the regex pattern. (use quotes around regex if the terminal is preemptively executing it)',
          default: false,
        }),
      handler: (argv: ArgumentsCamelCase) => {
        try {
          const payload: InitTree = {
            configUri: argv.config as string,
            doctypeUri: argv.doctype as string,
            rootFileName: argv.root as string | undefined,
            globIndexUris: argv.glob as string | undefined,
          };
          return find(argv.fname as string, payload, argv);
        } catch (e) {
          console.error(e);
        }
      }
    })

  // refactor links across garden

    .command({
      command: 'rename <old-fname> <new-fname>',
      aliases: ['rn'],
      describe: 'rename a file and all of its references.',
      builder: (yargs: yargs.Argv) => yargs
        .option('regex', {
          alias: 'r',
          type: 'boolean',
          describe: 'usage: rename <regex> <replace-string>; use regex replacement instead of string replacement -- this will rename all filenames containing matches to the regex pattern; the regex argument will be replaced by the string argument. (use quotes around regex if the terminal is preemptively executing it)',
          default: false,
        })
        .option('force', {
          alias: 'f',
          type: 'boolean',
          describe: 'skip verification prompt and perform operation',
          default: false,
        }),
      handler: (argv: ArgumentsCamelCase) => {
        try {
          if (argv.force || p.confirm(`rename "${argv.oldFname}" to "${argv.newFname}"`)) {
            rename(argv.oldFname as string, argv.newFname as string, argv);
          } else {
            p.abort();
          }
        } catch (e) {
          console.error(e);
        }
      }
    })

    .command({
      command: 'retypedoc <old-type> <new-type>',
      aliases: ['rtdoc', 'rtd'],
      describe: 'rename document type and update all occurrences.',
      builder: (yargs: yargs.Argv) => yargs
        .option('force', {
          alias: 'f',
          type: 'boolean',
          describe: 'skip verification prompt and perform operation',
          default: false,
        }),
      handler: (argv: ArgumentsCamelCase) => {
        try {
          if (argv.force || p.confirm(`retype doctype "${argv.oldType}" to "${argv.newType}"`)) {
            retypedoc(argv.oldType as string, argv.newType as string, argv);
          } else {
            p.abort();
          }
        } catch (e) {
          console.error(e);
        }
      }
    })

    .command({
      command: 'retyperef <old-type> <new-type>',
      aliases: ['rtref', 'rtr'],
      describe: 'rename reference type and all its occurrences.',
      builder: (yargs: yargs.Argv) => yargs
        .option('force', {
          alias: 'f',
          type: 'boolean',
          describe: 'skip verification prompt and perform operation',
          default: false,
        })
        .option('kind', {
          alias: 'k',
          type: 'string',
          describe: 'kind of entity to rename (kinds: "ref", "attr", "link"; default is "ref")',
          default: 'ref',
        }),
      handler: (argv: ArgumentsCamelCase) => {
        try {
          if (argv.force || p.confirm(`retype ${argv.kind}type "${argv.oldType}" to "${argv.newType}"`)) {
            retyperef(argv.oldType as string, argv.newType as string, argv);
          } else {
            p.abort();
          }
        } catch (e) {
          console.error(e);
        }
      }
    })

  // convert

  // todo: (both links and aml)

  // .command({
  //   command: 'cmntowiki [glob]',
  //   aliases: ['ctow'],
  //   describe: 'convert from commonmark to wiki syntax.',
  //   handler: (argv: ArgumentsCamelCase) =>
  //     cmmnToWiki(argv.glob as string, argv),
  // })

  // .command({
  //   command: 'wikitocmn [glob]',
  //   aliases: ['wtoc'],
  //   describe: 'convert from wiki to commonmark syntax.',
  //   handler: (argv: ArgumentsCamelCase) =>
  //     wikiToCmmn(argv.glob as string, argv),
  // })

    .command({
      command: 'mkdntowiki [glob]',
      aliases: ['mtow'],
      describe: 'convert from "[markdown](style)" to "[[wiki-style]]" internal links.',
      builder: (yargs: yargs.Argv) => yargs
        .option('force', {
          alias: 'f',
          type: 'boolean',
          describe: 'skip verification prompt and perform operation',
          default: false,
        })
        .option('format', {
          alias: 'F',
          type: 'string',
          describe: 'how to parse markdown links -- "filename", "relative" urls, or "absolute" urls',
          default: 'filename',
        })
        .option('kind', {
          alias: 'k',
          type: 'string',
          describe: `kind of references to convert\n(kinds: ${REL_KINDS.join(', ')}; default is "rel")`,
          default: 'ref',
        }),
      handler: (argv: ArgumentsCamelCase) => {
        try {
          if (argv.force || p.confirm('convert [markdown](links) to [[wikirefs]]')) {
            mkdnToWiki(argv.glob as string, argv);
          } else {
            p.abort();
          }
        } catch (e) {
          console.error(e);
        }
      }
    })

    .command({
      command: 'wikitomkdn [glob]',
      aliases: ['wtom'],
      describe: 'convert from "[[wiki-style]]" to "[markdown](style)" internal links.',
      builder: (yargs: yargs.Argv) => yargs
        .option('force', {
          alias: 'f',
          type: 'boolean',
          describe: 'skip verification prompt and perform operation',
          default: false,
        })
        .option('format', {
          alias: 'F',
          type: 'string',
          describe: 'how to format the resulting markdown links -- "filename", "relative" urls, or "absolute" urls',
          default: 'filename',
        })
        .option('kind', {
          alias: 'k',
          type: 'string',
          describe: `kind of references to convert\n(kinds: ${REL_KINDS.join(', ')}; default is "rel")`,
          default: 'ref',
        }),
      handler: (argv: ArgumentsCamelCase) => {
        try {
          if (argv.force || p.confirm('convert [[wikirefs]] to [markdown](links)')) {
            wikiToMkdn(argv.glob as string, argv);
          } else {
            p.abort();
          }
        } catch (e) {
          console.error(e);
        }
      }
    })

    .command({
      command: 'camltoyaml [glob]',
      aliases: ['ctoy'],
      describe: 'convert from "caml" to "yaml" style attributes.',
      builder: (yargs: yargs.Argv) => yargs
        .option('force', {
          alias: 'f',
          type: 'boolean',
          describe: 'skip verification prompt and perform operation',
          default: false,
        }),
      handler: (argv: ArgumentsCamelCase) => {
        try {
          if (argv.force || p.confirm('convert attributes from caml to yaml')) {
            camlToYaml(argv.glob as string, argv);
          } else {
            p.abort();
          }
        } catch (e) {
          console.error(e);
        }
      }
    })

    .command({
      command: 'yamltocaml [glob]',
      aliases: ['ytoc'],
      describe: 'convert from "yaml" to "caml" style attributes.',
      // builder: (yargs: yargs.CommandBuilder<Record<string, any>, Record<string, any>>) => yargs
      builder: (yargs: yargs.Argv) => yargs
        .option('force', {
          alias: 'f',
          type: 'boolean',
          describe: 'skip verification prompt and perform operation',
          default: false,
        })
        .option('format', {
          alias: 'F',
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
      handler: (argv: ArgumentsCamelCase) => {
        try {
          if (argv.force || p.confirm('convert attributes from yaml to caml')) {
            yamlToCaml(argv.glob as string, argv);
          } else {
            p.abort();
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
};
