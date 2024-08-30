import chalk from 'chalk';

import * as semtree from 'semtree';

import { getConfig } from '../util/config';
import { buildTreeData, getRootFileName } from '../util/tree';
import { getIndexFileUris } from '../util/util';


export function lint(payload: any, opts?: any): void {
  const config: any | undefined = getConfig(payload.configUri);
  const rootFileName: string | undefined = getRootFileName(config, payload.rootFileName);
  const indexFileUris: string[] | undefined = getIndexFileUris(payload.doctypeUri, payload.globIndexUris);
  if ((indexFileUris === undefined) || (indexFileUris.length === 0)) {
    console.error(chalk.red('❌ unable to find index files to lint'));
  } else {
    // tree
    const treeData: Record<string, string> = buildTreeData(indexFileUris);
    const cleanTreeData: Record<string, string> = semtree.extractTreeContent(treeData);
    // lint
    const lintOpts: any = {
      root: rootFileName || (config && config.garden && config.garden.root) ? config.garden.root : undefined,
      // add custom options if they are configured
      ...(config.lint && config.lint.indentKind && { indentKind: config.lint.indentKind }),
      ...(config.lint && config.lint.indentSize && { indentSize: config.lint.indentSize }),
      ...(config.lint && config.lint.mkdnBullet && { mkdnBullet: config.lint.mkdnBullet }),
      ...(config.lint && config.lint.wikiLink && { wikiLink: config.lint.wikiLink }),
    };
    // build lint result string
    const lintRes: void | { error: string, warn: string } = semtree.lint(cleanTreeData, lintOpts);
    let lintMsg: string = '';
    if (lintRes) {
      if (lintRes.error) {
        lintMsg += chalk.red('❌ lint errors:' + '\n\n' + lintRes.error);
      }
      if (lintRes.warn) {
        lintMsg += chalk.yellow('⚠️ lint warnings:' + '\n\n' + lintRes.warn);
      }
    } else {
      lintMsg = chalk.green('✅ all clean');
    }
    console.log(lintMsg);
  }
}
