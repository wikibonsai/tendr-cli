import fs from 'fs';
import path from 'path';

import glob from 'glob';
import chalk from 'chalk';
import matter from 'gray-matter';
import * as caml from 'caml-mkdn';

import { SemTree } from 'semtree';

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

export function buildTree(payload: InitTree): SemTree | undefined {
  const rootFileName: string | undefined = getRootFileName(payload.configUri, payload.rootFileName);
  if (rootFileName === undefined) { return; }
  const indexFileUris: string[] | undefined = getIndexFileUris(payload.doctypeUri, payload.globIndexUris);
  if (indexFileUris === undefined) { return; }
  // build tree data
  const treeData: Record<string, string> = {};
  indexFileUris.forEach((uri: string) => {
    try {
      const fileContent: string = fs.readFileSync(uri, 'utf-8').toString();
      const contentNoCAML: any = caml.load(fileContent).content;
      const attrLessContent: any = matter(contentNoCAML).content;
      const filename: string = path.basename(uri, path.extname(uri));
      treeData[filename] = attrLessContent;
    } catch (e) {
      console.warn(e);
    }
  });
  if (Object.keys(treeData).length === 0) {
    console.error('error with tree data payload -- result was empty');
  }
  try {
    const semtree: SemTree = new SemTree({
      // semtree options...
    });
    const msg: string = semtree.parse(treeData, rootFileName);
    if (typeof msg === 'string') {
      console.error(msg);
    } else {
      return semtree;
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
