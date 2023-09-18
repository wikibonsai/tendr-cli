import fs from 'fs';
import path from 'path';

import glob from 'glob';
import chalk from 'chalk';
import { table } from 'table';

import * as wikirefs from 'wikirefs';

import * as doctype from '../util/doctype';
import { MD } from '../util/const';
import { Node } from '../util/tree';
import { SemTree } from 'semtree';


/* eslint-disable indent */
// note:
//   'fam'  === 'ancestor' + 'child'      (tree relationships)
//   'ref'  === 'attr' + 'link' + 'embed' (web relationships)
//   'fore' === 'foreref'
//   'back' === 'backref'
export const REL_KINDS: string[] = [
  'rel',
              'fam', 'ancestor',    'child',
              'ref',     'attr',     'link',     'embed',
  'fore', 'foreref', 'foreattr', 'forelink', 'foreembed',
  'back', 'backref', 'backattr', 'backlink', 'backembed',
];
/* eslint-enable indent */

const EMPTY: string = chalk.dim('--');

function isEmpty(refs: Record<string, string[]> | string[]): boolean {
  // link or embed case
  if (Array.isArray(refs)) {
    return (refs.length === 1)
        && (refs[0] === EMPTY);
  // attr case
  } else {
    return JSON.stringify(refs) === JSON.stringify({ [EMPTY]: [] });
  }
}

export async function status(
  filename: string,
  semtree: Promise<SemTree | undefined>,
  doctypes: any[]| undefined,
  opts: any,
): Promise<void> {
  // console.log('status\nargs: ', filename, 'opts: ', opts);
  ////
  // enable vars
  const kind: string = (opts.kind && REL_KINDS.includes(opts.kind)) ? opts.kind : 'rel';
  const ancestor : boolean = (kind === 'rel') || (kind === 'fam') || (kind === 'ancestor');
  const child    : boolean = (kind === 'rel') || (kind === 'fam') || (kind === 'child');
  const fam      : boolean = (kind === 'rel') || (kind === 'fam') || (ancestor || child);
  const foreattr : boolean = (kind === 'rel') || (kind === 'ref') || (kind === 'fore') || (kind === 'foreref') || (kind === 'attr') || (kind === ('foreattr'));
  const forelink : boolean = (kind === 'rel') || (kind === 'ref') || (kind === 'fore') || (kind === 'foreref') || (kind === 'link') || (kind === ('forelink'));
  const foreembed: boolean = (kind === 'rel') || (kind === 'ref') || (kind === 'fore') || (kind === 'foreref') || (kind === 'embed') || (kind === ('foreembed'));
  const fore     : boolean = (kind === 'fore') || (foreattr || forelink || foreembed);
  const backattr : boolean = (kind === 'rel') || (kind === 'ref') || (kind === 'back') || (kind === 'backref') || (kind === 'attr') || (kind === ('backattr'));
  const backlink : boolean = (kind === 'rel') || (kind === 'ref') || (kind === 'back') || (kind === 'backref') || (kind === 'link') || (kind === ('backlink'));
  const backembed: boolean = (kind === 'rel') || (kind === 'ref') || (kind === 'back') || (kind === 'backref') || (kind === 'embed') || (kind === ('backembed'));
  const back     : boolean = (kind === 'back') || (backattr || backlink || backembed);
  const ref      : boolean = (kind === 'rel') || (kind === 'ref') || (foreattr || forelink || foreembed || backattr || backlink || backembed);
  // table vars
  const config: any = {
    border: {
      topBody: chalk.dim('─'),
      topJoin: chalk.dim('┬'),
      topLeft: chalk.dim('┌'),
      topRight: chalk.dim('┐'),

      bottomBody: chalk.dim('─'),
      bottomJoin: chalk.dim('┴'),
      bottomLeft: chalk.dim('└'),
      bottomRight: chalk.dim('┘'),

      bodyLeft: chalk.dim('│'),
      bodyRight: chalk.dim('│'),
      bodyJoin: chalk.dim('│'),

      joinBody: chalk.dim('─'),
      joinLeft: chalk.dim('├'),
      joinRight: chalk.dim('┤'),
      joinJoin: chalk.dim('┼'),
      joinMiddleLeft: chalk.dim('┤'),
      joinMiddleRight: chalk.dim('├'),
      joinMiddleDown: chalk.dim('┬'),
      joinMiddleUp: chalk.dim('┴'),
    }
  };
  // garden vars
  const cwd: string = process.cwd();
  const listGlob: string = cwd + '/**/*' + MD;
  const gardenFilePaths: string[] = glob.sync(listGlob);
  const allFileNames: string[] = gardenFilePaths.map((fp) => path.basename(fp, MD));
  /* eslint-disable indent */
  ////
  // file
  // data
  const thisFilePath: string | undefined = gardenFilePaths.filter((fp) => MD === path.extname(fp).toLowerCase())
                                                          .find((fp) => path.basename(fp, MD) === filename);
  // no file / zombie
  let dtype: string | undefined;
  if ((thisFilePath !== undefined)) {
    dtype = doctype.resolve(thisFilePath, doctypes);
  }
  // build table
  const fileTableData: string[][] = [];
  let fileRow: string[] = [];
  if (thisFilePath === undefined) {
    fileRow = [chalk.red('NO FILE'), chalk.dim(filename)];
  } else {
    fileRow = [chalk.green('FILE'), filename];
  }
  if (dtype !== undefined) {
    fileRow = fileRow.concat([chalk.green('DOCTYPE'), dtype]);
  }
  fileTableData.push(fileRow);
  ////
  // fam/tree
  const treeTableData: string[][] = [];
  const treeJob: Promise<void> = (async () => {
    if (fam) {
      return semtree.then((res: SemTree | undefined) => {
        // data
        const hasTree: boolean = (res instanceof SemTree);
        let ancestors: string[] = [];
        let children: string[] = [];
        let node: Node | undefined;
        if (hasTree) {
          // @ts-expect-error: 'hasTree' performs type-check above
          node = res.tree.find((node) => node.text === filename);
          if (ancestor) {
            ancestors = node ? node.ancestors : [];
          }
          if (child) {
            children = node ? node.children : [];
          }
          // build table
          if (ancestor) {
            const ancestorValue: string = (ancestors.length > 0) ? ancestors.join(' > ') : EMPTY;
            const formattedAncestors: string = ancestorValue.replace(/(.{60})/g, '$1\n');
            treeTableData.push([chalk.yellow('ANCESTORS'), formattedAncestors]);
          }
          if (child) {
            const childValue: string = (children.length > 0) ? '• ' + children.join('\n• ') : EMPTY;
            treeTableData.push([chalk.yellow('CHILDREN'), childValue]);
          }
        }
      });
    }
  })();
  /* eslint-enable indent */
  ////
  // ref/web
  const webTableData: any[] = [];
  // data
  const foreattrs: Record<string, string[]> = {};
  const forelinks: string[] = [];
  const foreembeds: string[] = [];
  const backattrs: Record<string, string[]> = {};
  const backlinks: string[] = [];
  const backembeds: string[] = [];
  // fore
  const webForeJob: Promise<void> = (async () => {
    if (ref && fore && (thisFilePath !== undefined)) {
      return fs.promises.readFile(thisFilePath, 'utf-8').then((res: string) => {
        const thisData: any[] = wikirefs.scan(res);
        for (const data of thisData) {
          // attr
          if (foreattr && (data.kind === wikirefs.CONST.WIKI.ATTR)) {
            for (const fnameData of data.filenames) {
              const type: string = data.type[0];
              const fname: string = fnameData[0];
              if (!Object.keys(foreattrs).includes(type)) {
                foreattrs[type] = [];
              }
              if (allFileNames.includes(fname)) {
                foreattrs[type].push(fname);
              } else {
                foreattrs[type].push(chalk.dim(fname));
              }
            }
          // link
          } else if (forelink && (data.kind === wikirefs.CONST.WIKI.LINK)) {
            const fname: string = path.basename(data.filename[0], MD);
            const type: string = data.type[0];
            const item: string = (type === undefined) ? fname : fname + ' (' + type + ')';
            if (allFileNames.includes(fname)) {
              forelinks.push(item);
            } else {
              forelinks.push(chalk.dim(item));
            }
          // embed
          } else if (foreembed && (data.kind === wikirefs.CONST.WIKI.EMBED)) {
            const fname: string = path.basename(data.filename[0], MD);
            if (allFileNames.includes(fname)) {
              foreembeds.push(fname);
            } else {
              foreembeds.push(chalk.dim(fname));
            }
          } else {
            // do nothing
          }
        }
      });
    }
  })();
  // back
  const webBackJob: Promise<void> = (async () => {
    if (ref && back) {
      /* eslint-disable indent */
      const thoseFilePaths: string[] | undefined = gardenFilePaths.filter((fp) =>
                                                                            (MD === path.extname(fp))
                                                                            && (path.basename(fp, MD) !== filename)
                                                                          );
      /* eslint-enable indent */
      // those / that vars
      if (!thoseFilePaths) { console.error(chalk.red('unable to find markdown files')); return; }
      for (const thatFilePath of thoseFilePaths) {
        const content: string = fs.readFileSync(thatFilePath, 'utf8');
        const thatData: any[] = wikirefs.scan(content, { filename: filename });
        for (const data of thatData) {
          // attr
          if (backattr && (data.kind === wikirefs.CONST.WIKI.ATTR)) {
            const type: string = data.type[0];
            const fname: string = path.basename(thatFilePath, MD);
            if (!Object.keys(backattrs).includes(type)) {
              backattrs[type] = [];
            }
            if (allFileNames.includes(fname)) {
              backattrs[type].push(fname);
            } else {
              backattrs[type].push(chalk.dim(fname));
            }
          // link
          } else if (backlink && (data.kind === wikirefs.CONST.WIKI.LINK)) {
            const fname: string = path.basename(thatFilePath, MD);
            const type: string = data.type[0];
            const item: string = (type === undefined) ? fname : fname + ' (' + type + ')';
            if (allFileNames.includes(fname)) {
              backlinks.push(item);
            } else {
              backlinks.push(chalk.dim(item));
            }
          // embed
          } else if (backembed && (data.kind === wikirefs.CONST.WIKI.EMBED)) {
            const fname: string = path.basename(thatFilePath, MD);
            if (allFileNames.includes(fname)) {
              backembeds.push(fname);
            } else {
              backembeds.push(chalk.dim(fname));
            }
          } else {
            // do nothing
          }
        }
      }
    }
  })();
  const webJob: Promise<void> = (async () => {
    if (ref) {
      return Promise.all([
        webForeJob,
        webBackJob,
      ]).then(() => {
        // empty data check
        if (Object.keys(foreattrs).length == 0) {
          foreattrs[EMPTY] = [];
        }
        if (forelinks.length === 0) {
          forelinks.push(EMPTY);
        }
        if (foreembeds.length === 0) {
          foreembeds.push(EMPTY);
        }
        if (Object.keys(backattrs).length == 0) {
          backattrs[EMPTY] = [];
        }
        if (backlinks.length === 0) {
          backlinks.push(EMPTY);
        }
        if (backembeds.length === 0) {
          backembeds.push(EMPTY);
        }
        ////
        // build table
        // label
        const labelRow: string[] = [''];
        if (backattr || backlink || backembed) {
          labelRow.push(chalk.blue('BACK'));
        }
        if (foreattr || forelink || foreembed) {
          labelRow.push(chalk.blue('FORE'));
        }
        webTableData.push(labelRow);
        // attr
        if (backattr || foreattr) {
          const attrRow: string[] = [chalk.blue('ATTR')];
          if (backattr) {
            attrRow.push(isEmpty(backattrs)
              ? EMPTY
              : Object.entries(backattrs).map((value: [string, string[]]) =>
                `◦ ${value[0]}\n`
                  + value[1].map((fname: string) => `  • ${fname}`).join('\n')).join('\n'));
          }
          if (foreattr) {
            attrRow.push(isEmpty(foreattrs)
              ? EMPTY
              : Object.entries(foreattrs).map((value: [string, string[]]) =>
                `◦ ${value[0]}\n`
                  + value[1].map((fname: string) => `  • ${fname}`).join('\n')).join('\n'));
          }
          webTableData.push(attrRow);
        }
        // link
        if (backlink || forelink) {
          const linkRow: string[] = [chalk.blue('LINK')];
          if (backlink) {
            linkRow.push(isEmpty(backlinks)
              ? EMPTY
              : '• ' + backlinks.join('\n• '));
          }
          if (forelink) {
            linkRow.push(isEmpty(forelinks)
              ? EMPTY
              : '• ' + forelinks.join('\n• '));
          }
          webTableData.push(linkRow);
        }
        // embed
        if (backembed || foreembed) {
          const embedRow: string[] = [chalk.blue('EMBED')];
          if (backembed) {
            embedRow.push(isEmpty(backembeds)
              ? EMPTY
              : '• ' + backembeds.join('\n• '));
          }
          if (foreembed) {
            embedRow.push(isEmpty(foreembeds)
              ? EMPTY
              : '• ' + foreembeds.join('\n• '));
          }
          webTableData.push(embedRow);
        }
      });
    }
  })();
  // finish building table text
  return Promise.all([
    treeJob,
    webJob,
  ]).then(() => {
    // print table
    const fileText: string = (fileTableData.length > 0) ? table(fileTableData, { ...config, header: {
      alignment: 'left',
      content: chalk.bold('📄 RELs for...'),
    }}) : '';
    const treeText: string = (treeTableData.length > 0) ? table(treeTableData, { ...config, header: {
      alignment: 'left',
      content: chalk.bold('🌳 FAM'),
    } }) : '';
    const webText: string = (webTableData.length > 0) ? table(webTableData, { ...config, header: {
      alignment: 'left',
      content: chalk.bold('🕸️ REF'),
    } }) : '';
    const output: string = fileText + treeText + webText;
    console.log(output);
  }).catch((e) => {
    console.error('problem with data', chalk.red(e));
  });
}
