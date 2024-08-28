import fs from 'fs';
import path from 'path';

import glob from 'glob';
import chalk from 'chalk';

import type { SemTree } from 'semtree';
import * as semtree from 'semtree';

import { getConfig, getDocTypes } from './config';
import { MD } from './const';
import { getFileUris } from './util';
import * as doctype from './doctype';


export interface InitTree {
  configUri: string;
  doctypeUri: string;
  rootFileName: string | undefined;
  globIndexUris: string | undefined;
}

export interface Node {
  text: string;
  ancestors: string[];
  children: string[];
}

export const INDEX_GLOB: string = './index/**/*';
export const ROOT_NAME : string = 'i.bonsai';

export async function buildTree(payload: InitTree): Promise<SemTree | undefined> {
  try {
    return Promise.resolve(buildTreeSync(payload));
  } catch (e) {
    return Promise.reject(e);
  }
}

export function buildTreeSync(payload: InitTree): SemTree | undefined {
  const rootFileName: string | undefined = getRootFileName(payload.configUri, payload.rootFileName);
  if (rootFileName === undefined) { return; }
  const indexFileUris: string[] | undefined = getIndexFileUris(payload.doctypeUri, payload.globIndexUris);
  if (indexFileUris === undefined) { return; }
  // build tree data
  const treeData: Record<string, string> = indexFileUris.reduce((map, uri) => {
    try {
      const filename: string = path.basename(uri, path.extname(uri));
      const fileContent: string = fs.readFileSync(uri, 'utf-8').toString();
      map[filename] = fileContent;
    } catch (e) {
      console.warn(e);
    }
    return map;
  }, {} as Record<string, string>);
  if (Object.keys(treeData).length === 0) {
    console.error('error with tree data payload -- result was empty');
  }
  try {
    const tree: SemTree | string = semtree.create(rootFileName, treeData);
    if (typeof tree === 'string') {
      console.error(tree);
    } else {
      return tree;
    }
  } catch (e) {
    console.error(e);
  }
}

// tree-related file operations
export function getRootFileName(configPath: string, root: string | undefined): string | undefined {
  const config: any | undefined = getConfig(configPath);
  const cwd: string = process.cwd();
  let rootName: string | undefined;
  if (root === undefined) {
    if (config && config.garden && config.garden.root) {
      rootName = config.garden.root;
    }
    if (rootName === undefined) { rootName = ROOT_NAME; }
  } else {
    rootName = root;
  }
  const files: string[] = glob.sync(cwd + '/**/' + rootName + MD);
  if ((files.length === 1) && files[0].indexOf(rootName) > -1) {
    return rootName;
  }
  console.warn(chalk.yellow('unable to find root with name: ' + '"' + rootName + '"'));
}

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
