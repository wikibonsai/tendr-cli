import fs from 'fs';
import path from 'path';

import glob from 'glob';
import * as yaml from 'js-yaml';
import matter from 'gray-matter';
import * as caml from 'caml-mkdn';
import * as wikirefs from 'wikirefs';

import { MD } from '../util/const';
import { getFileUris } from '../util/util';


////
// links (mkdn, wiki)

// todo: check opts are valid

export function mkdnToWiki(globPat: string | undefined, opts?: any) {
  // console.log('mkdnToWiki\nargs: ', globPat, 'opts: ', opts);
  // prepend 'wiki' to kind shorthand
  opts.kind = 'wiki' + opts.kind;
  const cwd: string = process.cwd();
  const fullGlob: string = globPat ? (cwd + globPat + MD) : (cwd + '/**/*' + MD);
  const vaultFilePaths: string[] = glob.sync(fullGlob);
  // const fnameToUriHash: Record<string, string> = {};
  // getFileUris().forEach((uri: string) => {
  //   const filename: string = path.basename(uri, MD);
  //   fnameToUriHash[filename] = uri;
  // });
  for (const thisFilePath of vaultFilePaths) {
    const content: string = fs.readFileSync(thisFilePath, 'utf8');
    const convertedContent: string | undefined = wikirefs.mkdnToWiki(content, opts);
    if (convertedContent !== undefined) {
      fs.writeFileSync(thisFilePath, convertedContent, 'utf8');
    }
  }
}

export function wikiToMkdn(globPat: string | undefined, opts?: any) {
  // console.log('wikiToMkdn\nargs: ', globPat, 'opts: ', opts);
  // prepend 'wiki' to kind shorthand
  opts.kind = 'wiki' + opts.kind;
  const cwd: string = process.cwd();
  const fullGlob: string = globPat ? (cwd + globPat + MD) : (cwd + '/**/*' + MD);
  const vaultFilePaths: string[] = glob.sync(fullGlob);
  const fnameToUriHash: Record<string, string> = {};
  getFileUris().forEach((uri: string) => {
    const filename: string = path.basename(uri, MD);
    fnameToUriHash[filename] = uri;
  });
  for (const thisFilePath of vaultFilePaths) {
    const content: string = fs.readFileSync(thisFilePath, 'utf8');
    const convertedContent: string | undefined = wikirefs.wikiToMkdn(content, {
      ...opts,
      fnameToUriHash,
    });
    if (convertedContent !== undefined) {
      fs.writeFileSync(thisFilePath, convertedContent, 'utf8');
    }
  }
}

////
// amls (caml, yaml)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function camlToYaml(globPat: string | undefined, opts?: any) {
  // console.log('camltoyaml\nargs: ', globPat, 'opts: ', opts);
  const cwd: string = process.cwd();
  const fullGlob: string = globPat ? (cwd + globPat + MD) : (cwd + '/**/*' + MD);
  const vaultFilePaths: string[] = glob.sync(fullGlob);
  for (const thisFilePath of vaultFilePaths) {
    const content: string = fs.readFileSync(thisFilePath, 'utf8');
    const camlStuff: any = caml.load(content);
    const data: any = camlStuff.data;
    if ((data === null)
    || (data === undefined)
    || (Object.keys(data).length === 0)
    ) {
      continue;
    }
    const attrLessContent: string = camlStuff.content;
    const yamlString: string = '---\n' + yaml.dump(data) + '---\n';
    fs.writeFileSync(thisFilePath, yamlString + attrLessContent, 'utf8');
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function yamlToCaml(globPat: string | undefined, opts?: any) {
  // console.log('yamltocaml\nargs: ', globPat, 'opts: ', opts);
  const cwd: string = process.cwd();
  const fullGlob: string = globPat ? (cwd + globPat + MD) : (cwd + '/**/*' + MD);
  const vaultFilePaths: string[] = glob.sync(fullGlob);
  for (const thisFilePath of vaultFilePaths) {
    const content: string = fs.readFileSync(thisFilePath, 'utf8');
    const matterStuff: any = matter(content);
    const data: any = matterStuff.data;
    const backToYaml: any = {};
    for (const [key, value] of Object.entries(data)) {
      if ((typeof value === 'object') && (value !== null) && (Object.keys(value).length > 0)) {
        backToYaml[key] = value;
        delete data[key];
      }
    }
    const attrLessContent: string = matterStuff.content;
    const yamlString: string = (JSON.stringify(backToYaml) === '{}') ? '' : '---\n' + yaml.dump(backToYaml) + '---\n';
    const camlString: string = caml.dump(data, { // mirrors caml dump defaults
      format    : opts.format     ? opts.format     : 'pretty', // 'pretty', 'pad', 'none'
      listFormat: opts.listFormat ? opts.listFormat : 'mkdn',   // 'mkdn', 'comma'
      prefix    : opts.prefix     ? opts.prefix     : true,
    });
    fs.writeFileSync(thisFilePath, yamlString + camlString + attrLessContent, 'utf8');
  }
}
