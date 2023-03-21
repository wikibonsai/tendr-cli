import type { ArgumentsCamelCase } from 'yargs';
import yargs from 'yargs';

import { camlToYaml, yamlToCaml } from '../cmds/aml';
import { list } from '../cmds/list';
import { rename } from '../cmds/rename';
import { retype } from '../cmds/retype';


// notes:
// <> required
// [] optional
// ... list

export const tendr = (argv: string[]): yargs.Argv => {
  return yargs(argv)
    .usage('usage: $0 <command>')
    .demandCommand(1, 'please provide a valid command.')
    .alias('tend', 't')
    .version('0.0.4')
    .wrap(null)
    .epilogue('cli tools for markdown-based digital gardening')
    .help()

    .command({
      command: 'list <filename>',
      aliases: ['ls'],
      describe: 'list all references for a given file',
      builder: (yargs) => yargs
        .option('kind', {
          alias: 'k',
          type: 'string',
          describe: 'kind of references to list\n(kinds: "ref", "foreref", "backref", "attr", "foreattr", "backattr", "link", "forelink", "backlink"; default is "ref")',
          default: 'ref',
        }),
      handler: (argv: ArgumentsCamelCase) => {
        list(argv.filename as string, argv);
      },
    })

    .command({
      command: 'rename <old-fname> <new-fname>',
      aliases: ['rn'],
      describe: 'rename a file and all of its references.',
      handler: (argv) => rename(argv.oldFname as string, argv.newFname as string, argv),
    })

    .command({
      command: 'retype <old-type> <new-type>',
      aliases: ['rt'],
      describe: 'rename reference type and all its occurrences.',
      builder: (yargs) => yargs
        .option('kind', {
          alias: 'k',
          type: 'string',
          describe: 'kind of entity to rename (kinds: "reftype", "attrtype", "linktype"; default is "reftype")',
          default: 'reftype',
        }),
      handler: (argv) => retype(argv.oldType as string, argv.newType as string, argv),
    })

    .command({
      command: 'camltoyaml [glob]',
      aliases: ['ctoy'],
      describe: 'convert between "caml" and "yaml" style attributes.',
      handler: (argv) => camlToYaml(argv.glob as string, argv),
    })

    .command({
      command: 'yamltocaml [glob]',
      aliases: ['ytoc'],
      describe: 'convert between "caml" and "yaml" style attributes.',
      builder: (yargs) => yargs
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
      handler: (argv) => yamlToCaml(argv.glob as string, argv),
    });
};
