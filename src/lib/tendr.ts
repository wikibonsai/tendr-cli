import { Command } from 'commander';

import { camlToYaml, yamlToCaml } from '../cmds/aml';
import { list } from '../cmds/list';
import { rename } from '../cmds/rename';
import { retype } from '../cmds/retype';


// notes:
// <> required
// [] optional
// ... list

const tendr: Command = new Command();

tendr
  .alias('tend')
  .alias('t')
  .version('0.0.3')
  .description('cli tools for markdown-based digital gardening');
// .helpOption('-c, --HELP', 'custom help message')

// commands

// print out stats for a vault or file
// number of each type of reference (including zombies...doctype?)
// tendr
//   .command('stat')
//   .alias('s')
//   .argument('[filename])
//   .description('show status of a vault or file')
//   // .addHelpText()
//   .option('-f, --filename <filename>', 'filename to rename')
//   // .option('-k, --kind [ref_kind]', 'kind of references -- to show status of')
//   .action((args, opts, cmd) => {
//     // fore (this file)
//     // back (rest of files)
//     // wikirefs.WIKI.ATTR
//     // wikirefs.WIKI.LINK
//   });

tendr
  .command('list')
  .alias('ls')
  .argument('<filename>')
  .description('list all references for a given file')
  // .addHelpText()
  .option('-k, --kind [ref_kinds]', 'kind of references to list\n(kinds: \'ref\', \'foreref\', \'backref\', \'attr\', \'foreattr\', \'backattr\', \'link\', \'forelink\', \'backlink\'; default is \'ref\')')
  .action((filename, opts, cmd) => list(filename, opts, cmd));

tendr
  .command('rename')
  .alias('rn')
  .argument('<old-fname>')
  .argument('<new-fname>')
  .description('rename a file and all of its references.')
  // .addHelpText()
  .action((oldFname, newFname, opts, cmd) => rename(oldFname, newFname, opts, cmd));

tendr
  .command('retype')
  .alias('rt')
  .argument('<old-type>')
  .argument('<new-type>')
  .description('rename reference type and all its occurrences.')
  // .addHelpText()
  .option('-k, --kind [kind]', 'kind of entity to rename (kinds: \'reftype\', \'attrtype\', \'linktype\'; default is \'reftype\')')
  .action((oldType, newType, opts, cmd) => retype(oldType, newType, opts, cmd));

// attr conversion

// note: if a raw glob is entered (without str quotes),
//       the terminal is automatically expanding the glob
//       into literal file paths...

tendr
  .command('camltoyaml')
  .alias('ctoy')
  .argument('[glob]')
  .description('convert between "caml" and "yaml" style attributes.')
  // .addHelpText()
  .action((glob, opts, cmd) => camlToYaml(glob, opts, cmd));

tendr
  .command('yamltocaml')
  .alias('ytoc')
  .argument('[glob]')
  .description('convert between "caml" and "yaml" style attributes.')
  .option('-f, --format [format]', 'how to format caml output (kinds: \'none\', \'pretty\', or \'pad\'; default is \'none\')')
  .option('-l, --list-format [list-format]', 'how to format caml output lists (kinds: \'mkdn\' or \'comma\'; default is \'mkdn\')')
  .option('-p, --no-prefix', 'do not use colon prefix in caml output')
  // .addHelpText()
  .action((glob, opts, cmd) => yamlToCaml(glob, opts, cmd));

export { tendr };
