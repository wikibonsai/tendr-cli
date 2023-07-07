import fs from 'fs';
import path from 'path';

import toml from '@iarna/toml';
import * as yaml from 'js-yaml';

import { CONFIG_PATH, DOCTYPE_PATH } from './const';


export function getConfig(uri?: string | undefined): any {
  let extKind: string;
  let configContent: string;
  if (uri === undefined) {
    extKind = 'toml';
    try {
      configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    } catch (e) {
      return {};
    }
  } else {
    extKind = path.extname(uri);
    try {
      configContent = fs.readFileSync(uri, 'utf8');
    } catch (e) {
      return {};
    }
  }
  if (extKind === '.toml') {
    const tomlData: any = toml.parse(configContent);
    if ((tomlData !== undefined) && (tomlData !== null)) { return tomlData; }
  }
  if (extKind === '.yaml' || extKind === '.yml') {
    const yamlData: any = yaml.load(configContent);
    if ((yamlData !== undefined) && (yamlData !== null)) { return yamlData; }
  }
  return {};
}

export function getDocTypes(uri?: string | undefined): any {
  let extKind: string;
  let doctypeContent: string;
  if (uri === undefined) {
    extKind = 'toml';
    try {
      doctypeContent = fs.readFileSync(DOCTYPE_PATH, 'utf8');
    } catch (e) {
      return {};
    }
  } else {
    extKind = path.extname(uri);
    try {
      doctypeContent = fs.readFileSync(uri, 'utf8');
    } catch (e) {
      return {};
    }
  }
  if (extKind === '.toml') {
    const tomlData: any = toml.parse(doctypeContent);
    if ((tomlData !== undefined) && (tomlData !== null)) { return tomlData; }
  }
  if (extKind === '.yaml' || extKind === '.yml') {
    const yamlData: any = yaml.load(doctypeContent);
    if ((yamlData !== undefined) && (yamlData !== null)) { return yamlData; }
  }
  return {};
}
