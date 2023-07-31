import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import * as caml from 'caml-mkdn';

import * as config from './config';


export function resolve(uri: string, doctypes: any): string | undefined {
  const filename: string = path.basename(uri, path.extname(uri));
  const paths: string[][] = [];
  // order of precedence:
  // prefix > attr metadata > directory
  for (const [type, opts] of Object.entries(doctypes)) {
    ////
    // prefix match
    if (Object.keys(opts as any).includes('prefix')) {
      // @ts-expect-error: prefix check in if-check above
      const prefix: string = opts.prefix;
      const filenameContainsPrefix: boolean = (filename.indexOf(prefix) === 0);
      const filenameContainsPrefixWithPlaceholder: boolean = convertPlaceholderToRgx(prefix).test(filename);
      if (filenameContainsPrefix || filenameContainsPrefixWithPlaceholder) {
        return type;
      }
    }
    ////
    // attr match
    const fileContent: string = fs.readFileSync(uri, 'utf-8').toString();
    const camlData: any = caml.load(fileContent).data;
    const yamlData: any = matter(fileContent).data;
    // todo: get default metadata from config
    if (camlData || yamlData) {
      if (Object.keys(camlData).includes(type)) {
        return type;
      }
      if (Object.keys(yamlData).includes(type)) {
        return type;
      }
    }
    ////
    // directory match
    if ((opts as any).path) {
      const cwd: string = process.cwd();
      const typeUri: string = path.join(cwd, (opts as any).path);
      if (uri.indexOf(typeUri) === 0) {
        paths.push([type, typeUri]);
      }
    }
  }
  // return 'type' whose 'path' has the most specificity
  if (paths.length > 0) {
    return paths.reduce((a, b) => a[1].length > b[1].length ? a : b)[0];
  }
  return;
}

// doc ids

export function getIDFormat(configUri?: string): any {
  const configData: any = config.getConfig(configUri);
  // id format for filenames (as opposed to ids for attributes/node ids; see vscode-wikibonsai's package.json)
  const alphabet: string = (configData.file.id && configData.file.id.alphabet) ? configData.id.alphabet : 'abcdefghijklmnopqrstuvwxyz';
  const size: number = (configData.file.id && configData.file.id.size) ? configData.id.size : 8;
  return { alphabet, size };
}

// i have a bad feeling this is going to breed bugs...👀
export function convertPlaceholderToRgx(
  str: string,
  IDFormat: any = {
    alphabet: '',
    size: 0,
  },
): RegExp {
  const id: RegExp = new RegExp(
    '[' + IDFormat.alphabet + ']' +
    '{' + String(IDFormat.size) + '}'
  );
  /* eslint-disable indent */
  return new RegExp(str.replace('.', '\\.')                           // escape regex chars that are normal chars
                        .replace(/(?::id)/, id.source)                // Generate an id from [nanoid](https://github.com/ai/nanoid).
                        .replace(/(?::date)/, '\\d{4}-\\d{2}-\\d{2}') // Generate the current date (format: `YYYY-MM-DD`).
                        .replace(/(?::year)/, '\\d{4}')               // Generate the current year (format: `YYYY`).
                        .replace(/(?::month)/, '\\d{2}')              // Generate the current month (format: `MM`).
                        .replace(/(?::day)/, '\\d{2}')                // Generate the current day (format: `DD`).
                        .replace(/(?::hour)/, '\\d{2}')               // Generate the current hour (format: `HH`).
                        .replace(/(?::minute)/, '\\d{2}'));           // Generate the current minute (format: `mm`).
  /* eslint-enable indent */
}
