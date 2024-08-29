import path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';
import chalk from 'chalk';

import { MD } from './const';
import { getDocTypes } from './config';
import * as doctype from './doctype';


// files

export function getFileNames(): string[] {
  const cwd: string = process.cwd();
  const listGlob: string = cwd + '/**/*' + MD;
  const vaultFilePaths: string[] = glob.sync(listGlob);
  return vaultFilePaths.map((fp) => path.basename(fp, MD));
}

export function getFileUris(): string[] {
  const cwd: string = process.cwd();
  const listGlob: string = cwd + '/**/*' + MD;
  return glob.sync(listGlob);
}

export const INDEX_GLOB: string = './index/**/*';

export function getIndexFileUris(doctypePath: string, indexGlob: string | undefined): string[] | undefined {
  let fileUris: string[] = [];
  // ...from glob
  if (indexGlob !== undefined) {
    try {
      fileUris = glob.sync(path.join(process.cwd(), indexGlob + MD));
      if (fileUris.length === 0) {
        console.warn(chalk.yellow('no index files found at location: ' + '"' + indexGlob + '"'));
        return;
      }
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  // ...from doctype
  const doctypes: any = getDocTypes(doctypePath);
  if (doctypes.index) {
    const gardenFileUris: string[] = getFileUris();
    gardenFileUris.forEach((uri: string) => {
      const dtype: string | undefined = doctype.resolve(uri, doctypes);
      if (dtype === 'index') {
        fileUris.push(uri);
      }
    });
    if (fileUris.length === 0) {
      console.error('no index files found from doctype payload: ' + JSON.stringify(doctypes));
      return;
    }
  }
  // check base default (e.g. './index/')
  // if no 'index' doctype provided
  if (fileUris.length === 0) {
    fileUris = glob.sync(path.join(process.cwd(), INDEX_GLOB + MD));
  }
  return fileUris;
}

// regex

export function hasOneCapGrp(regexStr: string): boolean {
  /* eslint-disable indent */
  // Convert the regex to a string and remove escaped parentheses and non-capturing groups
  const regexString = regexStr.replace(/\\[()]/g, '')        // Remove escaped parentheses
                              .replace(/\(\?:[^)]*\)/g, ''); // Remove non-capturing groups
  /* eslint-enable indent */
  const hasLeftRightParen: RegExpMatchArray | null = regexString.match(/\([^)]*\)/g);
  return hasLeftRightParen !== null && hasLeftRightParen.length === 1;
}

export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch (e) {
    return false;
  }
}

// cli

export function ls(path: string): string | undefined {
  try {
    return execSync(`ls ${path}`).toString();
  } catch (e) {
    console.error(`error executing 'ls': ${e}`);
  }
}
