import path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';
import { MD } from './const';


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
