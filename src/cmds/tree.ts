import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import glob from 'glob';
import * as yaml from 'js-yaml';
import matter from 'gray-matter';
import * as caml from 'caml-mkdn';

import { SemTree } from 'semtree';

import { MD } from '../util/const';
import { getFileNames } from '../util/util';


export interface Node {
  text: string;
  ancestors: string[];
  children: string[];
}

export function tree(root: string, indexFileUris: string[], opts: any) {
  const allFileNames: string[] = getFileNames();
  // build tree data
  const treeData: Record<string, string> = {};
  const indexFileNames: string[] = indexFileUris.map((uri: string) => path.basename(uri, MD));
  indexFileUris.forEach((uri: string) => {
    const fileContent: string = fs.readFileSync(uri, 'utf-8').toString();
    const contentNoCAML: any = caml.load(fileContent).content;
    const attrLessContent: any = matter(contentNoCAML).content;
    const filename: string = path.basename(uri, path.extname(uri));
    treeData[filename] = attrLessContent;
  });
  try {
    // build tree
    const semtree: SemTree = new SemTree({
      suffix: 'none',
      setRoot: () => root,
    });
    const msg: string = semtree.parse(treeData, root);
    // print
    if (typeof msg === 'string') {
      console.log(msg);
    } else {
      console.log(printTree(semtree.root, semtree.tree));
    }
  } catch (e) {
    console.error(e);
    return;
  }

  // helper function to render tree
  function printTree(curNodeName: string, nodes: Node[], prefix: string = ''): string {
    let tree: string;
    const isIndexFile: boolean = indexFileNames.includes(curNodeName);
    const isLeafFile: boolean = allFileNames.includes(curNodeName);
    // isZombieFile = (!isIndexFile && !isLeafFile)
    if (isIndexFile) {
      tree = chalk.yellow(curNodeName + '\n');
    } else if (isLeafFile) {
      tree = chalk.green(curNodeName + '\n');
    } else {
      tree = chalk.dim(curNodeName + '\n');
    }
    const node: Node | undefined = nodes.find((node: Node) => node.text === curNodeName);
    if (node === undefined) { return tree; }
    node.children.forEach((child: string, index: number) => {
      const isLastChild: boolean = (index === node.children.length - 1);
      const childPrefix: string = prefix + (isLastChild ? chalk.yellow('└── ') : chalk.yellow('├── '));
      const grandchildPrefix: string = prefix + (isLastChild ? '    ' : chalk.yellow('|   '));
      const subtree: string = printTree(child, nodes, grandchildPrefix);
      tree += childPrefix + subtree;
    });
    return tree;
  }
}
