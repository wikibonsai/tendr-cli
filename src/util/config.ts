import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import toml from '@iarna/toml';
import * as yaml from 'js-yaml';

import { CONFIG_PATH, DOCTYPE_PATH } from './const';


export function getConfig(uri?: string | undefined): any {
  return get(uri, CONFIG_PATH);
}

export function getDocTypes(uri?: string | undefined): any {
  return get(uri, DOCTYPE_PATH);
}

function get(uri: string | undefined, uriDefault: string = CONFIG_PATH): any {
  let content: string;
  const useUri: string = uri || uriDefault;
  const extKind: string = path.extname(useUri);
  // extract content
  try {
    content = fs.readFileSync(useUri, 'utf8');
  } catch (e) {
    // console.warn(chalk.red(e));
    return {};
  }
  // process data
  if (extKind === '.toml') {
    const tomlData: any = toml.parse(content);
    if ((tomlData !== undefined) && (tomlData !== null)) { return tomlData; }
  }
  if (extKind === '.yaml' || extKind === '.yml') {
    const yamlData: any = yaml.load(content);
    if ((yamlData !== undefined) && (yamlData !== null)) { return yamlData; }
  }
  return {};
}
