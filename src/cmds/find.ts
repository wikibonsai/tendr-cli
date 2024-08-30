import chalk from 'chalk';

import { MD } from '../util/const';
import { getFileUris, isValidRegex } from '../util/util';


export function find(fname: string, payload: any, opts?: any): void {
  if (opts.regex && !isValidRegex(fname)) {
    console.error(chalk.red(`"${fname}" is not valid regex`));
  } else {
    const indexFileUris: string[] | undefined = getFileUris();
    if ((indexFileUris === undefined) || (indexFileUris.length === 0)) {
      console.error(chalk.red('❌ unable to find files'));
    }
    const mdFiles: string[] = [];
    for (const uri of indexFileUris) {
      const mdExt: RegExp = new RegExp(MD + '$', 'g');
      const found: boolean = (opts.regex)
        ? new RegExp(fname).test(uri.split('/').pop()?.replace(mdExt, '') ?? '')
        : ((uri.split('/').pop()?.replace(mdExt, '') ?? '') === fname);
      if (uri.endsWith(MD) && found) {
        mdFiles.push(uri);
      }
    }
    if (mdFiles.length === 0) {
      console.log('🍂 no files found');
    } else {
      console.log(mdFiles.join('\n'));
    }
  }
}
