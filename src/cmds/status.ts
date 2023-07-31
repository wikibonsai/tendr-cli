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

export function status(
  filename: string,
  semtree: SemTree | string | undefined,
  doctypes: any[]| undefined,
  opts: any,
): void {
  // console.log('status\nargs: ', filename, 'opts: ', opts);
  ////
  // vars
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
  ////
  // go
  const cwd: string = process.cwd();
  const listGlob: string = cwd + '/**/*' + MD;
  const gardenFilePaths: string[] = glob.sync(listGlob);
  const allFileNames: string[] = gardenFilePaths.map((fp) => path.basename(fp, MD));
  const hasTree: boolean = (semtree instanceof SemTree);
  /* eslint-disable indent */
  ////
  // file
  const thisFilePath: string | undefined = gardenFilePaths.filter((fp) => MD === path.extname(fp).toLowerCase())
                                                          .find((fp) => path.basename(fp, MD) === filename);
  // no file / zombie
  let dtype: string | undefined;
  if ((thisFilePath !== undefined)) {
    dtype = doctype.resolve(thisFilePath, doctypes);
  }
  ////
  // fam/tree
  // if (fam) {
    let ancestors: string[] = [];
    let children: string[] = [];
    let node: Node | undefined;
    if (hasTree) {
      // @ts-expect-error: 'hasTree' performs type-check above
      node = semtree.tree.find((node) => node.text === filename);
      if (ancestor) {
        ancestors = node ? node.ancestors : [];
      }
      if (child) {
        children = node ? node.children : [];
      }
    }
  // }
  /* eslint-enable indent */
  ////
  // ref/web
  // if (ref) {
  const foreattrs: Record<string, string[]> = {};
  const forelinks: string[] = [];
  const foreembeds: string[] = [];
  const backattrs: Record<string, string[]> = {};
  const backlinks: string[] = [];
  const backembeds: string[] = [];
  if (thisFilePath === undefined) {
    foreattrs[EMPTY] = [];
    forelinks.push(EMPTY);
    foreembeds.push(EMPTY);
  }
  ////
  // fore
  if (fore && (thisFilePath !== undefined)) {
    // this vars
    let content: string | undefined = undefined;
    try {
      content = fs.readFileSync(thisFilePath, 'utf8');
    } catch (e: any) {
      console.error(e);
      return;
    }
    const data: any[] = wikirefs.scan(content);
    // attr
    if (foreattr) {
      /* eslint-disable indent */
      const wikiattrs: [string, string[]][] = data.filter((i: any) => i.kind === wikirefs.CONST.WIKI.ATTR)
                                                  .map((d: any) => [d.type[0], d.filenames.map((fileInfo: any) => fileInfo[0])]);
      /* eslint-enable indent */
      if (wikiattrs.length === 0) {
        foreattrs[EMPTY] = [];
      } else {
        for (const wa of wikiattrs) {
          const type: string = wa[0];
          const fnames: string[] = wa[1];
          foreattrs[type] = [];
          for (const fn of fnames) {
            if (allFileNames.includes(fn)) {
              foreattrs[type].push(fn);
            } else {
              foreattrs[type].push(chalk.dim(fn));
            }
          }
        }
      }
    }
    // link
    if (forelink) {
      /* eslint-disable indent */
      const wikilinks: [string, string | undefined][] = data.filter((i: any) => i.kind === wikirefs.CONST.WIKI.LINK)
                                                            .map((d: any) => [d.filename[0], d.type ? d.type[0] : undefined]);
      /* eslint-enable indent */
      if (wikilinks.length === 0) {
        forelinks.push(EMPTY);
      } else {
        for (const wl of wikilinks) {
          const item: string = (wl[1] === undefined) ? wl[0] : wl[0] + ' (' + wl[1] + ')';
          if (allFileNames.includes(wl[0])) {
            forelinks.push(item);
          } else {
            forelinks.push(chalk.dim(item));
          }
        }
      }
    }
    // embed
    if (foreembed) {
      /* eslint-disable indent */
      const wikiembeds: string[] = data.filter((i: any) => i.kind === wikirefs.CONST.WIKI.EMBED)
                                      .map((d: any) => d.filename[0]);
      /* eslint-enable indent */
      if (wikiembeds.length === 0) {
        foreembeds.push(EMPTY);
      } else {
        for (const we of wikiembeds) {
          if (allFileNames.includes(we)) {
            foreembeds.push(we);
          } else {
            foreembeds.push(chalk.dim(we));
          }
        }
      }
    }
  }
  ////
  // back
  if (back) {
    // those / that vars
    /* eslint-disable indent */
    const thoseFilePaths: string[] | undefined = gardenFilePaths.filter((fp) =>
                                                                        (MD === path.extname(fp))
                                                                        && (path.basename(fp, MD) !== filename)
                                                                      );
    /* eslint-enable indent */
    if (!thoseFilePaths) { console.error(chalk.red('unable to find filenames')); return; }
    // attr
    if (backattr) {
      // [attrtype, filename]
      let wikiattrs: [string, string][];
      try {
        /* eslint-disable indent */
        wikiattrs = thoseFilePaths.map((thatFilePath: string) => {
                                    const content: string = fs.readFileSync(thatFilePath, 'utf8');
                                    const thatData: any[] = wikirefs.scan(content,{
                                                                                    kind: wikirefs.CONST.WIKI.ATTR,
                                                                                    filename: filename,
                                                                                  });
                                    const value: [string, any] = [thatFilePath, thatData];
                                    return value;
                                  })
                                  .filter((value: any) => value[1].length > 0)
                                  .flatMap((value: any) => value[1].map((res: any) => [res.type[0], path.basename(value[0], MD)]));
      /* eslint-enable indent */
      } catch (e: any) {
        console.error(chalk.red(e));
        return;
      }
      if (wikiattrs.length === 0) {
        backattrs[EMPTY] = [];
      } else {
        for (const [attrtype, fname] of wikiattrs) {
          if (!Object.keys(backattrs).includes(attrtype)) {
            backattrs[attrtype] = [];
          }
          if (allFileNames.includes(fname)) {
            backattrs[attrtype].push(fname);
          } else {
            backattrs[attrtype].push(chalk.dim(fname));
          }
        }
      }
    }
    // link
    if (backlink) {
      // [attrtype, filename]
      let wikilinks: [string, string][];
      try {
      /* eslint-disable indent */
      wikilinks = thoseFilePaths.map((thatFilePath: string) => {
                                  const content: string = fs.readFileSync(thatFilePath, 'utf8');
                                  const thatData: any = wikirefs.scan(content,{
                                                                                kind: wikirefs.CONST.WIKI.LINK,
                                                                                filename: filename,
                                                                              });
                                  const value: [string, any] = [thatFilePath, thatData];
                                  return value;
                                })
                                .filter((value: any) => value[1].length > 0)
                                .flatMap((value: any) => value[1].map((res: any) => [path.basename(value[0], MD), res.type[0]]));
      /* eslint-enable indent */
      } catch (e: any) {
        console.error(chalk.red(e));
        return;
      }
      if (wikilinks.length === 0) {
        backlinks.push(EMPTY);
      } else {
        for (const wl of wikilinks) {
          const fname: string = wl[0];
          const type: string = wl[1];
          const item: string = (type === undefined) ? fname : fname + ' (' + type + ')';
          if (allFileNames.includes(fname)) {
            backlinks.push(item);
          } else {
            backlinks.push(chalk.dim(item));
          }
        }
      }
    }
    // embeds
    if (backembed) {
      let embedFileNames: Set<string>;
      try {
      /* eslint-disable indent */
      embedFileNames = new Set(thoseFilePaths.filter((thatFilePath: string) => {
                                              const content: string = fs.readFileSync(thatFilePath, 'utf8');
                                              const thatData: any = wikirefs.scan(content,{
                                                                                            kind: wikirefs.CONST.WIKI.EMBED,
                                                                                            filename: filename,
                                                                                          });
                                              return thatData.length > 0;
                                            })
                                            .map((thatFilePath: string) => path.basename(thatFilePath, MD)));
      /* eslint-enable indent */
      } catch (e: any) {
        console.error(chalk.red(e));
        return;
      }
      if (embedFileNames.size === 0) {
        backembeds.push(EMPTY);
      } else {
        for (const efn of embedFileNames) {
          if (allFileNames.includes(efn)) {
            backembeds.push(efn);
          } else {
            backembeds.push(chalk.dim(efn));
          }
        }
      }
    }
  }
  // }
  ////
  // table
  // configure table
  const config: any = {
    // configure below...
    spanningCells: [],
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
  // configure 'spanningCells' dynamically
  const fileSpanningCells: any[] = [];
  const treeSpanningCells: any[] = [];
  const webSpanningCells: any[] = [];

  // build tables
  const fileTableData: any[] = [];
  const treeTableData: any[] = [];
  const webTableData: any[] = [];

  // file table
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

  // tree table
  if (hasTree && fam) {
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

  // web table

  if (ref) {
    // ref column label row
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
  }
  // print tables
  const fileText: string = (fileTableData.length > 0) ? table(fileTableData, { ...config, spanningCells: fileSpanningCells, header: {
    alignment: 'left',
    content: chalk.bold('📄 RELs for...'),
  }}) : '';
  const treeText: string = (treeTableData.length > 0) ? table(treeTableData, { ...config, spanningCells: treeSpanningCells, header: {
    alignment: 'left',
    content: chalk.bold('🌳 FAM'),
  } }) : '';
  const webText: string = (webTableData.length > 0) ? table(webTableData, { ...config, spanningCells: webSpanningCells, header: {
    alignment: 'left',
    content: chalk.bold('🕸️ REF'),
  } }) : '';
  console.log(fileText + treeText + webText);
}
