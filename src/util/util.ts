import fs from 'fs';
import path from 'path';

import glob from 'glob';
import matter from 'gray-matter';
import * as caml from 'caml-mkdn';

import { MD } from './const';


// files

export function getFileNames(): string[] {
  const cwd: string = process.cwd();
  const listGlob: string = cwd + '/**/*' + MD;
  const vaultFilePaths: string[] = glob.sync(listGlob);
  return vaultFilePaths.map((fp) => path.basename(fp, MD));
}

export function getFileUris(): string[] {
  const cwd: string = process.cwd();
  const listGlob: string = cwd + '/**/*' + MD;
  return glob.sync(listGlob);
}

// doctype

export function resolveDocType(uri: string, doctypes: any): string {
  const filename: string = path.basename(uri, path.extname(uri));
  // order of precedence:
  // prefix > attr metadata > directory
  for (const [type, opts] of Object.entries(doctypes)) {
    // if prefix match
    if ((opts as any).prefix) {
      if (filename.indexOf(doctypes.index.prefix) === 0) {
        return type;
      }
    }
    // if attr match
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
    // if directory match
    if ((opts as any).path) {
      const cwd: string = process.cwd();
      const typeUri: string = path.join(cwd, (opts as any).path);
      if (uri.indexOf(typeUri) === 0) {
        return type;
      }
    }
  }
  return 'default';
}
