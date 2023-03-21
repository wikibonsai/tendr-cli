import fs from 'fs';
import path from 'path';
import glob from 'glob';
import chalk from 'chalk';
import * as wikirefs from 'wikirefs';

import { MD } from '../lib/const';


export function list(filename: string, opts: any) {
  // console.log('list\nargs: ', filename, 'opts: ', opts);
  // vars
  // note:
  //   'ref' === 'attr' + 'link'
  //   'fore' === 'foreref'
  //   'back' === 'backref'
  /* eslint-disable indent */
  const validKinds: string[] = [
                'ref',     'attr',     'link',     'embed',
    'fore', 'foreref', 'foreattr', 'forelink', 'foreembed',
    'back', 'backref', 'backattr', 'backlink', 'backembed',
  ];
  const kind: string = (opts.kind && validKinds.includes(opts.kind)) ? opts.kind : 'ref';
  /* eslint-enable indent */
  // go
  const cwd: string = process.cwd();
  const listGlob: string = cwd + '/**/*' + MD;
  const vaultFilePaths: string[] = glob.sync(listGlob);
  const allFileNames: string[] = vaultFilePaths.map((fp) => path.basename(fp, MD));
  const output: string[] = [];
  /* eslint-disable indent */
  const thisFilePath: string | undefined = vaultFilePaths.filter((fp) => MD === path.extname(fp).toLowerCase())
                                                          .find((fp) => path.basename(fp, MD) === filename);
  /* eslint-enable indent */
  if (thisFilePath === undefined) {
    output.push(chalk.red('NO FILE FOR: ') + chalk.dim(filename));
  } else {
    output.push(chalk.yellow('FILE: ') + filename);
  }
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
    output.push(chalk.blue('FORE'));
    const data: any[] = wikirefs.scan(content);
    // attr
    if (!kind.includes('link') && !kind.includes('embed')) {
      output.push(chalk.green('  ATTRS'));
      /* eslint-disable indent */
      const wikiattrs: string[] = data.filter((i: any) => i.kind === wikirefs.CONST.WIKI.ATTR)
                                      .flatMap((d: any) => d.filenames.map((fileInfo: any) => fileInfo[0]));
      /* eslint-enable indent */
      // console.log(data, wikiattrs);
      if (wikiattrs.length === 0) {
        output.push(chalk.dim('      no wikiattrs'));
      } else {
        for (const wa of wikiattrs) {
          if (allFileNames.includes(wa)) {
            output.push('      ' + wa);
          } else {
            output.push(chalk.dim('      ' + wa));
          }
        }
      }
    }
    // link
    if (!kind.includes('attr') && !kind.includes('embed')) {
      output.push(chalk.green('  LINKS'));
      /* eslint-disable indent */
      const wikilinks: string[] = data.filter((i: any) => i.kind === wikirefs.CONST.WIKI.LINK)
                                        .map((d: any) => d.filename[0]);
      /* eslint-enable indent */
      if (wikilinks.length === 0) {
        output.push(chalk.dim('      no wikilinks'));
      } else {
        for (const wl of wikilinks) {
          if (allFileNames.includes(wl)) {
            output.push('      ' + wl);
          } else {
            output.push(chalk.dim('      ' + wl));
          }
        }
      }
    }
    // embed
    if (!kind.includes('attr') && !kind.includes('link')) {
      output.push(chalk.green('  EMBEDS'));
      /* eslint-disable indent */
      const wikiembeds: string[] = data.filter((i: any) => i.kind === wikirefs.CONST.WIKI.EMBED)
                                        .map((d: any) => d.filename[0]);
      /* eslint-enable indent */
      if (wikiembeds.length === 0) {
        output.push(chalk.dim('      no wikiembeds'));
      } else {
        for (const we of wikiembeds) {
          if (allFileNames.includes(we)) {
            output.push('      ' + we);
          } else {
            output.push(chalk.dim('      ' + we));
          }
        }
      }
    }
  }
  ////
  // back
  if (!kind.includes('fore')) {
    output.push(chalk.blue('BACK'));
    // those / that vars
    /* eslint-disable indent */
    const thoseFilePaths: string[] | undefined = vaultFilePaths.filter((fp) =>
                                                                        (MD === path.extname(fp))
                                                                        && (path.basename(fp, MD) !== filename)
                                                                      );
    /* eslint-enable indent */
    if (!thoseFilePaths) { console.error('unable to find filenames'); return; }
    // attr
    if (!kind.includes('link') && !kind.includes('embed')) {
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
        output.push(chalk.dim('      no wikiattrs'));
      } else {
        for (const afn of attrFileNames) {
          if (allFileNames.includes(afn)) {
            output.push('      ' + afn);
          } else {
            output.push(chalk.dim('      ' + afn));
          }
        }
      }
    }
    // link
    if (!kind.includes('attr') && !kind.includes('embed')) {
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
        output.push(chalk.dim('      no wikilinks'));
      } else {
        for (const lfn of linkFileNames) {
          if (allFileNames.includes(lfn)) {
            output.push('      ' + lfn);
          } else {
            output.push(chalk.dim('      ' + lfn));
          }
        }
      }
    }
    // embeds
    if (!kind.includes('attr') && !kind.includes('link')) {
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
        output.push(chalk.dim('      no wikiembeds'));
      } else {
        for (const efn of embedFileNames) {
          if (allFileNames.includes(efn)) {
            output.push('      ' + efn);
          } else {
            output.push(chalk.dim('      ' + efn));
          }
        }
      }
    }
  }
  // print
  console.log(output.join('\n'));
}