import chalk from 'chalk';

import { SemTree } from 'semtree';

import { Node } from '../util/tree';
import { getFileNames } from '../util/util';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tree(semtree: SemTree, opts: any) {
  // generate filenames for printTree() function below
  const allFileNames: string[] = getFileNames();
  // todo:
  // const indexFileNames: string[] = semtree.trunk;
  const indexFileNames: string[] = Array.from(new Set(Object.values(semtree.petioleMap)));

  console.log(printTree(semtree.root, semtree.tree));

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
