import fs from 'fs';
import path from 'path';

import glob from 'glob';
import matter from 'gray-matter';
import * as caml from 'caml-mkdn';

import { SemTree } from 'semtree';

import { getConfig, getDocTypes } from './config';
import { INDEX_GLOB, MD, ROOT_NAME } from './const';
import { getFileUris, resolveDocType } from './util';


export interface Node {
  text: string;
  ancestors: string[];
  children: string[];
}

export function buildTree(root: string, indexFileUris: string[]): SemTree |  string {
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
    return 'error with tree data payload -- result was empty';
  }
  try {
    // build tree
    const semtree: SemTree = new SemTree({
      // semtree options...
    });
    const msg: string = semtree.parse(treeData, root);
    // print
    if (typeof msg === 'string') {
      return msg;
    } else {
      return semtree;
    }
  } catch (e) {
    return e as unknown as string;
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
  console.error('unable to find root with name: ' + '"' + rootName + '"');
}

export function getIndexFileUris(doctypePath: string, indexGlob: string | undefined): string[] | undefined {
  let fileUris: string[] = [];
  // ...from glob
  if (indexGlob !== undefined) {
    try {
      fileUris = glob.sync(path.join(process.cwd(), indexGlob + MD));
      if (fileUris.length === 0) {
        console.error('no index files found at location: ' + '"' + indexGlob + '"');
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
    getFileUris().forEach((uri: string) => {
      const doctype: string = resolveDocType(uri, doctypes);
      if (doctype === 'index') {
        fileUris.push(uri);
      }
    });
    if (fileUris.length === 0) {
      console.error('no index files found from doctype payload: ' + doctypes);
      return;
    }
  }
  // ...from base default (e.g. './index/' dir)
  if (fileUris.length === 0) {
    fileUris = glob.sync(path.join(process.cwd(), INDEX_GLOB + MD));
  }
  return fileUris;
}
