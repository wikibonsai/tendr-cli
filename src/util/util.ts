import fs from 'fs';
import path from 'path';

import glob from 'glob';
import toml from '@iarna/toml';
import * as yaml from 'js-yaml';
import matter from 'gray-matter';
import * as caml from 'caml-mkdn';

import { CONFIG_PATH, DOCTYPE_PATH, INDEX_GLOB, MD, ROOT_NAME } from './const';


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

export function getConfig(uri?: string | undefined): any {
  let extKind: string;
  let configContent: string;
  if (uri === undefined) {
    extKind = 'toml';
    try {
      configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    } catch (e) {
      return {};
    }
  } else {
    extKind = path.extname(uri);
    try {
      configContent = fs.readFileSync(uri, 'utf8');
    } catch (e) {
      return {};
    }
  }
  if (extKind === '.toml') {
    const tomlData: any = toml.parse(configContent);
    if ((tomlData !== undefined) && (tomlData !== null)) { return tomlData; }
  }
  if (extKind === '.yaml' || extKind === '.yml') {
    const yamlData: any = yaml.load(configContent);
    if ((yamlData !== undefined) && (yamlData !== null)) { return yamlData; }
  }
  return {};
}

export function getDocTypes(uri?: string | undefined): any {
  let extKind: string;
  let doctypeContent: string;
  if (uri === undefined) {
    extKind = 'toml';
    try {
      doctypeContent = fs.readFileSync(DOCTYPE_PATH, 'utf8');
    } catch (e) {
      return {};
    }
  } else {
    extKind = path.extname(uri);
    try {
      doctypeContent = fs.readFileSync(uri, 'utf8');
    } catch (e) {
      return {};
    }
  }
  if (extKind === '.toml') {
    const tomlData: any = toml.parse(doctypeContent);
    if ((tomlData !== undefined) && (tomlData !== null)) { return tomlData; }
  }
  if (extKind === '.yaml' || extKind === '.yml') {
    const yamlData: any = yaml.load(doctypeContent);
    if ((yamlData !== undefined) && (yamlData !== null)) { return yamlData; }
  }
  return {};
}

// save:
// process.cwd(), fs.readdirSync(process.cwd()

// regex

export function buildGlob(filenames: string[]): string {
  return (filenames.length === 0)
    ? './**/*.md'
    : './**/' + '@[' + filenames.join('|') + ']' + MD;
}

// files

// recursively search directory and subdirectories for given filename
export function findFilePath(
  filename: string,
  curDir?: string,
  res?: (string | undefined)[],
): string | undefined {
  if (!curDir) { curDir = './'; }
  if (!res) { res = []; }
  fs.readdirSync(curDir).forEach((curFile: string) => {
    // @ts-expect-error: validated above
    const absPath: string = path.join(curDir, curFile);
    // console.log(absPath);
    if (fs.statSync(absPath).isDirectory()) {
      // @ts-expect-error: validated above
      res.push(findFilePath(filename, absPath));
    } else {
      if (path.basename(curFile, MD) === filename) {
        // @ts-expect-error: validated above
        res.push(absPath);
      }
    }
  });
  return res.find((r) => r !== undefined);
}

// doctype

function resolveDocType(uri: string, doctypes: any): string {
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

// tree-related file operations
export function getRootFileName(configPath: string, root: string | undefined): string | undefined {
  const config: any | undefined = getConfig(configPath);
  const cwd: string = process.cwd();
  let rootName: string | undefined;
  if (root === undefined) {
    if (config && config.garden && config.garden.root) {
      rootName = config.garden.root;
    }
    if (rootName === undefined) { rootName = ROOT_NAME; }
  } else {
    rootName = root;
  }
  const files: string[] = glob.sync(cwd + '/**/' + rootName + MD);
  if ((files.length === 1) && files[0].indexOf(rootName) > -1) {
    return rootName;
  }
  console.error('unable to find root with name: ' + '"' + rootName + '"');
}

export function getIndexFileUris(doctypePath: string, indexGlob: string | undefined): string[] | undefined {
  let fileUris: string[] = [];
  // ...from glob
  if (indexGlob !== undefined) {
    try {
      fileUris = glob.sync(path.join(process.cwd(), indexGlob + MD));
      if (fileUris.length === 0) {
        console.error('no index files found at location: ' + '"' + indexGlob + '"');
        return;
      }
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  // ...from doctype
  const doctypes: any = getDocTypes(doctypePath);
  if (doctypes.index) {
    getFileUris().forEach((uri: string) => {
      const doctype: string = resolveDocType(uri, doctypes);
      if (doctype === 'index') {
        fileUris.push(uri);
      }
    });
    if (fileUris.length === 0) {
      console.error('no index files found from doctype payload: ' + doctypes);
      return;
    }
  }
  // ...from base default (e.g. './index/' dir)
  if (fileUris.length === 0) {
    fileUris = glob.sync(path.join(process.cwd(), INDEX_GLOB + MD));
  }
  return fileUris;
}
