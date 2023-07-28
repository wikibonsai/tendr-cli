import fs from 'fs';
import path from 'path';
import glob from 'glob';
import chalk from 'chalk';

import * as wikirefs from 'wikirefs';

import { MD } from '../util/const';


export function retypedoc(oldType: string, newType: string, opts: any) {
  console.log(chalk.yellow('`retypedoc` is not yet impelemented. 😱'));
}

export function retyperef(oldType: string, newType: string, opts: any) {
  // console.log('retype\nargs: ', oldType, newType, 'opts: ', opts);
  // append 'type' to kind shorthand
  opts.kind = opts.kind + 'type';
  const output: string[] = [chalk.green('UPDATED FILES:')];
  const outputError: string [] = [chalk.red('UPDATE FAILED: ')];
  const cwd: string = process.cwd();
  const fullGlob: string = cwd + '/**/*' + MD;
  const vaultFilePaths: string[] = glob.sync(fullGlob);
  for (const thisFilePath of vaultFilePaths) {
    // rename all [[wiki]] occurrences in file
    const oldContent: string = fs.readFileSync(thisFilePath, 'utf8');
    let newContent: string;
    if (!opts.kind || (opts.kind === wikirefs.CONST.TYPE.REF)) {
      newContent = wikirefs.retypeRefType(oldType, newType, oldContent);
    } else if (opts.kind && (opts.kind === wikirefs.CONST.TYPE.ATTR)) {
      newContent = wikirefs.retypeAttrType(oldType, newType, oldContent);
    } else if (opts.kind && (opts.kind === wikirefs.CONST.TYPE.LINK)) {
      newContent = wikirefs.retypeLinkType(oldType, newType, oldContent);
    } else {
      console.log(chalk.red(`Invalid reftype kind: ${opts.kind}`));
      return;
    }
    try {
      fs.writeFileSync(thisFilePath, newContent, 'utf8');
      // add to output if there was an update
      if (oldContent !== newContent) {
        output.push('  ' + path.basename(thisFilePath, MD));
      }
    } catch (e: any) {
      outputError.push(chalk.red('  ' + e));
    }
  }
  output.concat(outputError);
  if (output.length === 1) {
    output.push(chalk.dim('  ' + 'none'));
  }
  console.log(output.join('\n'));
}
