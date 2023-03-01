import fs from 'fs';
import path from 'path';
import glob from 'glob';
import chalk from 'chalk';

import * as wikirefs from 'wikirefs';

import { MD } from '../lib/const';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function rename(oldFname: string, newFname: string, opts: any, cmd: any) {
  // console.log('args: ', oldFname, newFname, 'opts: ', opts);
  const output: string[] = [chalk.green('UPDATED FILES:')];
  const outputError: string [] = [chalk.red('UPDATE FAILED: ')];
  const cwd: string = process.cwd();
  const fullGlob: string = cwd + '/**/*' + MD;
  const vaultFilePaths: string[] = glob.sync(fullGlob);
  const thisOldFilePath: string | undefined = vaultFilePaths.find((f) => path.basename(f, MD) === oldFname);
  // rename file
  if (thisOldFilePath === undefined) {
    console.log(chalk.red(`Cannot find filename: ${oldFname}`));
    return;
  } else {
    const thisNewFilepath: string = thisOldFilePath.replace(oldFname + MD, newFname + MD);
    try {
      fs.renameSync(thisOldFilePath, thisNewFilepath);
    } catch (e: any) {
      console.error(chalk.red(e));
      return;
    }
    const oldIndex: number = vaultFilePaths.indexOf(thisOldFilePath);
    vaultFilePaths[oldIndex] = thisNewFilepath;
  }
  // rename all [[wiki]] occurrences in file
  for (const thisFilePath of vaultFilePaths) {
    const oldContent: string = fs.readFileSync(thisFilePath, 'utf8');
    const newContent: string = wikirefs.renameFileName(oldFname, newFname, oldContent);
    // update content
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
  console.log(output.join('\n'));
}
