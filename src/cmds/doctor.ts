import chalk from 'chalk';

import * as semtree from 'semtree';
import { check as checkConfig } from '@wikibonsai/trug';
import { check as checkTypes } from '@wikibonsai/almanac';

import { getConfig, getDocTypes, getRelTypes } from '../util/config';
import { buildTreeData, getRootFileName } from '../util/tree';
import { getIndexFileUris } from '../util/util';


export function doctor(payload: any, opts?: any): void {
  const config: any | undefined = getConfig(payload.configUri);
  const docData: any = getDocTypes(payload.doctypeUri);
  const relData: any = getRelTypes(payload.reltypeUri);

  // library validators
  const configResult = checkConfig(config, relData);
  const typeResult = checkTypes(docData, relData);

  let hasIssues: boolean = false;
  // print config validation results
  for (const err of configResult.errors) {
    console.log(chalk.red(`❌ [config] ${err.message}`));
    hasIssues = true;
  }
  for (const warn of configResult.warnings) {
    console.log(chalk.yellow(`⚠️ [config] ${warn.message}`));
    hasIssues = true;
  }
  // print type validation results
  for (const err of typeResult.errors) {
    console.log(chalk.red(`❌ [types] ${err.message}`));
    hasIssues = true;
  }
  for (const warn of typeResult.warnings) {
    console.log(chalk.yellow(`⚠️ [types] ${warn.message}`));
    hasIssues = true;
  }

  // semtree lint
  const rootFileName: string | undefined = getRootFileName(config, payload.rootFileName);
  const indexFileUris: string[] | undefined = getIndexFileUris(payload.doctypeUri, payload.globIndexUris);
  if ((indexFileUris === undefined) || (indexFileUris.length === 0)) {
    console.error(chalk.red('❌ unable to find index files to lint'));
  } else {
    // tree
    const treeData: Record<string, string> = buildTreeData(indexFileUris);
    const cleanTreeData: Record<string, string> = semtree.extractTreeContent(treeData);
    // lint (validator)
    const fmt: any = config.format || config.lint;
    const lintOpts: any = {
      root: rootFileName || (config && config.garden && config.garden.root) ? config.garden.root : undefined,
      ...(fmt && fmt.indentKind && { indentKind: fmt.indentKind }),
      ...(fmt && fmt.indentSize && { indentSize: fmt.indentSize }),
      ...(fmt && fmt.mkdnBullet && { mkdnBullet: fmt.mkdnBullet }),
      ...(fmt && fmt.wikiLink && { wikiLink: fmt.wikiLink }),
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
    } else if (!hasIssues) {
      lintMsg = chalk.green('✅ all clean');
    }
    if (lintMsg) {
      console.log(lintMsg);
    }
  }
}
