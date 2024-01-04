import fs from 'fs';
import path from 'path';
import glob from 'glob';
import chalk from 'chalk';

import * as wikirefs from 'wikirefs';

import { MD } from '../util/const';
import { isValidRegex } from '../util/util';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function rename(oldFname: string, newFname: string, opts?: any) {
  // console.log('rename\nargs: ', oldFname, newFname, 'opts: ', opts);
  ////
  // setup
  if (opts.regex) {
    // validate regex
    if (!isValidRegex(oldFname)) {
      console.error(chalk.red('"oldFname" is not a valid regex'));
      return;
    }
  }
  const oldSrchPat: string | RegExp = opts.regex ? new RegExp(oldFname, 'g') : oldFname;
  const outputFnames: string[] = [chalk.green('UPDATED FILENAMES:')];
  const outputFiles: string[] = [chalk.green('UPDATED FILE CONTENT:')];
  const outputError: string [] = [chalk.red('UPDATE FAILED: ')];
  const cwd: string = process.cwd();
  const fullGlob: string = cwd + '/**/*' + MD;
  const vaultFilePaths: string[] = glob.sync(fullGlob);
  const updatedVaultFilePaths: string[] = [];
  const fileNameUpdates: string[][] = [];
  let oldFnameString: string | undefined;
  let newFnameString: string | undefined;
  let thisNewFilePath: string;
  // rename file
  for (const thisFilePath of vaultFilePaths) {
    if ((path.basename(thisFilePath, MD) === oldFname) || path.basename(thisFilePath, MD).match(oldSrchPat)) {
      if (!opts.regex) {
        oldFnameString = oldFname;
        newFnameString = newFname;
        thisNewFilePath = thisFilePath.replace(oldFname + MD, newFname + MD);
      } else {
        // construct 'oldFnameString'
        oldFnameString = path.basename(thisFilePath, MD);
        newFnameString = oldFnameString.replace(oldSrchPat, newFname);
        thisNewFilePath = thisFilePath.substring(0, thisFilePath.length - oldFnameString.length - MD.length) + newFnameString + MD;
        fileNameUpdates.push([oldFnameString, newFnameString]);
      }
      try {
        // rename file
        fs.renameSync(thisFilePath, thisNewFilePath);
        outputFnames.push('  ' + oldFnameString + ' -> ' + newFnameString);
        // replace old filename with new filename
        updatedVaultFilePaths.push(thisNewFilePath);
      } catch (e: any) {
        outputError.push(chalk.red('  [FILENAME]' + e));
        return;
      }
    } else {
      updatedVaultFilePaths.push(thisFilePath);
    }
  }
  // rename all [[wiki]] occurrences in file
  for (const thisFilePath of updatedVaultFilePaths) {
    const oldContent: string = fs.readFileSync(thisFilePath, 'utf8');
    let newContent: string;
    if (!opts.regex) {
      newContent = wikirefs.renameFileName(oldFname, newFname, oldContent);
    } else {
      let editContent: string = oldContent;
      for (const [oldFnameStr, newFnameStr] of fileNameUpdates) {
        editContent = wikirefs.renameFileName(oldFnameStr, newFnameStr, editContent);
      }
      newContent = editContent;
    }
    // update content
    try {
      fs.writeFileSync(thisFilePath, newContent, 'utf8');
      // add to output if there was an update
      if (oldContent !== newContent) {
        outputFiles.push('  ' + path.basename(thisFilePath, MD));
      }
    } catch (e: any) {
      outputError.push(chalk.red('  [FILE CONTENT]' + e));
    }
  }
  const output: string[] = (outputError.length > 1)
    ? outputFnames.concat(outputFiles).concat(outputError)
    : outputFnames.concat(outputFiles);
  console.log(output.join('\n'));
}
