import fs from 'fs';

import chalk from 'chalk';
import { loadConfig } from 'trug';
import { loadDocTypes, loadRelTypes } from 'almanac';

import { CONFIG_PATH, DOCTYPE_PATH, RELTYPE_PATH } from './const';


function warnIfMissing(uri: string): boolean {
  try {
    fs.readFileSync(uri, 'utf8');
    return false;
  } catch (e: any) {
    console.warn(chalk.yellow(e));
    return true;
  }
}

export function getConfig(uri?: string): any {
  const useUri: string = uri || CONFIG_PATH;
  if (warnIfMissing(useUri)) return {};
  return loadConfig(useUri);
}

export function getDocTypes(uri?: string): any {
  const useUri: string = uri || DOCTYPE_PATH;
  if (warnIfMissing(useUri)) return {};
  return loadDocTypes(useUri);
}

export function getRelTypes(uri?: string): any {
  // reltypes are optional — silently return empty if missing
  const useUri: string = uri || RELTYPE_PATH;
  if (!fs.existsSync(useUri)) return {};
  return loadRelTypes(useUri);
}
