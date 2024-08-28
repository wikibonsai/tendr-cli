import chalk from 'chalk';

import type { SemTree } from 'semtree';

import { Node } from '../util/tree';
import { getFileNames } from '../util/util';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tree(tree: SemTree, opts: any) {
  console.log(printTree(tree.root, tree.nodes));

  // helper function to render tree
  function printTree(curNodeName: string, nodes: Node[], prefix: string = ''): string {
    let printedTree: string;
    const isTrunkFile: boolean = tree.trunk.includes(curNodeName);
    const isLeafFile: boolean = !tree.trunk.includes(curNodeName) && getFileNames().includes(curNodeName);
    //const isZombieFile: boolean = (!isIndexFile && !isLeafFile)
    if (isTrunkFile) {
      // trunk case
      printedTree = chalk.yellow(curNodeName + '\n');
    } else if (isLeafFile) {
      // leaf case
      printedTree = chalk.green(curNodeName + '\n');
    } else {
      // zombie case
      printedTree = chalk.dim(curNodeName + '\n');
    }
    const node: Node | undefined = nodes.find((node: Node) => node.text === curNodeName);
    if (node === undefined) { return printedTree; }
    node.children.forEach((child: string, index: number) => {
      const isLastChild: boolean = (index === node.children.length - 1);
      const childPrefix: string = prefix + (isLastChild ? chalk.yellow('└── ') : chalk.yellow('├── '));
      const grandchildPrefix: string = prefix + (isLastChild ? '    ' : chalk.yellow('|   '));
      const subtree: string = printTree(child, nodes, grandchildPrefix);
      printedTree += childPrefix + subtree;
    });
    return printedTree;
  }
}
