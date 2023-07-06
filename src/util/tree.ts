import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import * as caml from 'caml-mkdn';

import { SemTree } from 'semtree';


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
