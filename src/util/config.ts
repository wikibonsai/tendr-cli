import fs from 'fs';
import path from 'path';

import toml from '@iarna/toml';
import * as yaml from 'js-yaml';

import { CONFIG_PATH, DOCTYPE_PATH } from './const';


export function getConfig(uri?: string | undefined): any {
  return get(uri, CONFIG_PATH);
}

export function getDocTypes(uri?: string | undefined): any {
  return get(uri, DOCTYPE_PATH);
}

function get(uri?: string | undefined, kind: string = CONFIG_PATH): any {
  let extKind: string;
  let content: string;
  if (uri === undefined) {
    extKind = 'toml';
    try {
      content = fs.readFileSync(kind, 'utf8');
    } catch (e) {
      return {};
    }
  } else {
    extKind = path.extname(uri);
    try {
      content = fs.readFileSync(uri, 'utf8');
    } catch (e) {
      return {};
    }
  }
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