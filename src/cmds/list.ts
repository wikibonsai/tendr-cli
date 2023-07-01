import fs from 'fs';
import path from 'path';
import glob from 'glob';
import chalk from 'chalk';
import { table } from 'table';

import * as wikirefs from 'wikirefs';

import { MD } from '../util/const';


/* eslint-disable indent */
// note:
//   'fam'  === 'ancestor' + 'children' (tree relationships)
//   'ref'  === 'attr' + 'link'         (web relationships)
//   'fore' === 'foreref'
//   'back' === 'backref'
export const REL_KINDS: string[] = [
  // 'rel',
  // 'fam', 'ancestor', 'children',
              'ref',     'attr',     'link',     'embed',
  'fore', 'foreref', 'foreattr', 'forelink', 'foreembed',
  'back', 'backref', 'backattr', 'backlink', 'backembed',
];
/* eslint-enable indent */

const EMPTY: string = chalk.dim('--');

function isEmpty(refs: string[]): boolean {
  return (refs.length === 1) && (refs[0] === EMPTY);
}
 
export function list(filename: string, opts: any) {
  // console.log('list\nargs: ', filename, 'opts: ', opts);
  // vars
  const kind: string = (opts.kind && REL_KINDS.includes(opts.kind)) ? opts.kind : 'ref';
  const foreattr: boolean = !kind.includes('back') && !kind.includes('link') && !kind.includes('embed');
  const foreembed: boolean = !kind.includes('back') && !kind.includes('attr') && !kind.includes('link');
  const forelink: boolean = !kind.includes('back') && !kind.includes('attr') && !kind.includes('embed');
  const backattr: boolean = !kind.includes('fore') && !kind.includes('link') && !kind.includes('embed');
  const backlink: boolean = !kind.includes('fore') && !kind.includes('attr') && !kind.includes('embed');
  const backembed: boolean = !kind.includes('fore') && !kind.includes('attr') && !kind.includes('link');
  // temp data vars
  // const ancestors: string[] = [];
  // const children: string[] = [];
  const foreattrs: string[] = [];
  const forelinks: string[] = [];
  const foreembeds: string[] = [];
  const backattrs: string[] = [];
  const backlinks: string[] = [];
  const backembeds: string[] = [];
  ////
  // go
  const cwd: string = process.cwd();
  const listGlob: string = cwd + '/**/*' + MD;
  const vaultFilePaths: string[] = glob.sync(listGlob);
  const allFileNames: string[] = vaultFilePaths.map((fp) => path.basename(fp, MD));
  const output: string[] = [];
  /* eslint-disable indent */
  const thisFilePath: string | undefined = vaultFilePaths.filter((fp) => MD === path.extname(fp).toLowerCase())
                                                          .find((fp) => path.basename(fp, MD) === filename);
  // no file / zombie
  if (thisFilePath === undefined) {
    foreattrs.push(EMPTY);
    forelinks.push(EMPTY);
    foreembeds.push(EMPTY);
  }
  /* eslint-enable indent */
  ////
  // fore
  if (!kind.includes('back') && (thisFilePath !== undefined)) {
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
      const wikiattrs: string[] = data.filter((i: any) => i.kind === wikirefs.CONST.WIKI.ATTR)
                                      .flatMap((d: any) => d.filenames.map((fileInfo: any) => fileInfo[0]));
      /* eslint-enable indent */
      if (wikiattrs.length === 0) {
        foreattrs.push(EMPTY);
      } else {
        for (const wa of wikiattrs) {
          if (allFileNames.includes(wa)) {
            foreattrs.push(wa);
          } else {
            foreattrs.push(chalk.dim(wa));
          }
        }
      }
    }
    // link
    if (forelink) {
      /* eslint-disable indent */
      const wikilinks: string[] = data.filter((i: any) => i.kind === wikirefs.CONST.WIKI.LINK)
                                        .map((d: any) => d.filename[0]);
      /* eslint-enable indent */
      if (wikilinks.length === 0) {
        forelinks.push(EMPTY);
      } else {
        for (const wl of wikilinks) {
          if (allFileNames.includes(wl)) {
            forelinks.push(wl);
          } else {
            forelinks.push(chalk.dim(wl));
          }
        }
      }
    }
    // embed
    if (foreembed) {
      output.push(chalk.green('  EMBEDS'));
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
  if (!kind.includes('fore')) {
    // those / that vars
    /* eslint-disable indent */
    const thoseFilePaths: string[] | undefined = vaultFilePaths.filter((fp) =>
                                                                        (MD === path.extname(fp))
                                                                        && (path.basename(fp, MD) !== filename)
                                                                      );
    /* eslint-enable indent */
    if (!thoseFilePaths) { console.error('unable to find filenames'); return; }
    // attr
    if (backattr) {
      output.push(chalk.green('  ATTRS'));
      let attrFileNames: Set<string>;
      try {
        /* eslint-disable indent */
        attrFileNames = new Set(thoseFilePaths.filter((thatFilePath: string) => {
                                                const content: string = fs.readFileSync(thatFilePath, 'utf8');
                                                const thatData: any = wikirefs.scan(content,{
                                                                                              kind: wikirefs.CONST.WIKI.ATTR,
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
      if (attrFileNames.size === 0) {
        backattrs.push(EMPTY);
      } else {
        for (const afn of attrFileNames) {
          if (allFileNames.includes(afn)) {
            backattrs.push(afn);
          } else {
            backattrs.push(chalk.dim(afn));
          }
        }
      }
    }
    // link
    if (backlink) {
      output.push(chalk.green('  LINKS'));
      let linkFileNames: Set<string>;
      try {
      /* eslint-disable indent */
      linkFileNames = new Set(thoseFilePaths.filter((thatFilePath: string) => {
                                              const content: string = fs.readFileSync(thatFilePath, 'utf8');
                                              const thatData: any = wikirefs.scan(content,{
                                                                                            kind: wikirefs.CONST.WIKI.LINK,
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
      if (linkFileNames.size === 0) {
        backlinks.push(EMPTY);
      } else {
        for (const lfn of linkFileNames) {
          if (allFileNames.includes(lfn)) {
            backlinks.push(lfn);
          } else {
            backlinks.push(chalk.dim(lfn));
          }
        }
      }
    }
    // embeds
    if (backembed) {
      output.push(chalk.green('  EMBEDS'));
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
  ////
  // table
  // configure table
  const config: any = {
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
  // collapse columns if fore or back is excluded
  if (!kind.includes('back') && !kind.includes('fore')) {
    config.spanningCells.push(
      { col: 1, row: 0, colSpan: 2, alignment: 'left' }
    );
  }
  // build table
  const tableData: any[] = [];
  if (thisFilePath === undefined) {
    tableData.push([chalk.red('NO FILE'), chalk.dim(filename)]);
  } else {
    tableData.push([chalk.green('FILE'), filename]);
  }
  // pad file row if both fore and back are on
  if (!kind.includes('back') && !kind.includes('fore')) {
    tableData[tableData.length - 1].push('');
  }
  if (!kind.includes('back') && !kind.includes('fore')) {
    tableData.push([
      '',
      !kind.includes('fore') ? chalk.blue('BACK') : '',
      !kind.includes('back') ? chalk.blue('FORE') : '',
    ]);
  } else {
    tableData.push([
      '',
      !kind.includes('fore') ? chalk.blue('BACK') : chalk.blue('FORE'),
    ]);
  }
  // fore AND back
  if (!kind.includes('back') && !kind.includes('fore')) {
    if (foreattr || backattr) {
      tableData.push([
        chalk.blue('ATTR'),
        backattr ? (isEmpty(backattrs) ? backattrs : '• ' + backattrs.join('\n• ')) : '',
        foreattr ? (isEmpty(foreattrs) ? foreattrs : '• ' + foreattrs.join('\n• ')) : '',
      ]);
    }
    if (forelink || backlink) {
      tableData.push([
        chalk.blue('LINK'),
        backlink ? (isEmpty(backlinks) ? backlinks : '• ' + backlinks.join('\n• ')) : '',
        forelink ? (isEmpty(forelinks) ? forelinks : '• ' + forelinks.join('\n• ')) : '',
      ]);
    }
    if (foreembed || backembed) {
      tableData.push([
        chalk.blue('EMBED'),
        backembed ? (isEmpty(backembeds) ? backembeds : '• ' + backembeds.join('\n• ')) : '',
        foreembed ? (isEmpty(foreembeds) ? foreembeds : '• ' + foreembeds.join('\n• ')) : '',
      ]);
    }
  // fore OR back
  } else {
    if (foreattr || backattr) {
      tableData.push([
        chalk.blue('ATTR'),
        backattr
          ? isEmpty(backattrs)
            ? backattrs
            : '• ' + backattrs.join('\n• ')
          : isEmpty(foreattrs)
            ? foreattrs
            : '• ' + foreattrs.join('\n• '),
      ]);
    }
    if (forelink || backlink) {
      tableData.push([
        chalk.blue('LINK'),
        backlink
          ? isEmpty(backlinks)
            ? backlinks
            : '• ' + backlinks.join('\n• ')
          : isEmpty(forelinks)
            ? forelinks
            : '• ' + forelinks.join('\n• '),
      ]);
    }
    if (foreembed || backembed) {
      tableData.push([
        chalk.blue('EMBED'),
        backembed
          ? isEmpty(backembeds)
            ? backembeds
            : '• ' + backembeds.join('\n• ')
          : isEmpty(foreembeds)
            ? foreembeds
            : '• ' + foreembeds.join('\n• '),
      ]);
    }
  }
  // print
  console.log(table(tableData, config));
}
