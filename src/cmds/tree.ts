import path from 'path';

import chalk from 'chalk';

import { SemTree } from 'semtree';

import { MD } from '../util/const';
import { Node, buildTree } from '../util/tree';
import { getFileNames } from '../util/util';


export function tree(root: string, indexFileUris: string[], opts: any) {
  // generate filenames for printTree() function below
  const allFileNames: string[] = getFileNames();
  const indexFileNames: string[] = indexFileUris.map((uri: string) => path.basename(uri, MD));

  // build tree
  const semtree: SemTree | string = buildTree(root, indexFileUris);
  if (typeof semtree === 'string') {
    console.error(semtree);
  } else if (semtree instanceof SemTree) {
    console.log(printTree(semtree.root, semtree.tree));
  } else {
    console.error('error');
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
