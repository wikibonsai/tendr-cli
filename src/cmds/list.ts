import fs from 'fs';
import path from 'path';

import glob from 'glob';
import * as wikirefs from 'wikirefs';
import type { SemTree } from 'semtree';

import { getDocTypes } from '../util/config';
import { MD } from '../util/const';
import { buildTreeSync, type InitTree } from '../util/tree';


function formatCountLine(label: string, count: number): string {
  // Match the aligned style from the requested output.
  return `  ${label.padEnd(19)}${count}`;
}

export function list(payload: InitTree, _opts?: any): void {
  const cwd: string = process.cwd();
  const listGlob: string = cwd + '/**/*' + MD;
  const gardenFilePaths: string[] = glob.sync(listGlob);

  function isMarkdown(fp: string): boolean {
    return MD === path.extname(fp).toLowerCase();
  }  

  const mdFilePaths: string[] = gardenFilePaths.filter(isMarkdown);
  const nodeNames: string[] = mdFilePaths.map((fp) => path.basename(fp, MD));
  const nodes: number = nodeNames.length;

  // `semtree` may emit lint warnings to stdout/stderr during tree creation.
  // The `list` command is intended to be a clean census, so suppress those
  // messages while building the tree.
  let semtree: SemTree | undefined;
  const origLog: typeof console.log = console.log;
  const origWarn: typeof console.warn = console.warn;
  const origError: typeof console.error = console.error;
  try {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    semtree = buildTreeSync(payload);
  } finally {
    console.log = origLog;
    console.warn = origWarn;
    console.error = origError;
  }
  const treeNodeNames: Set<string> = new Set((semtree?.nodes || []).map((n) => n.text));
  const tree: number = treeNodeNames.size;
  const orphans: number = nodeNames.filter((n) => !treeNodeNames.has(n)).length;

  // Scan references + compute "web" / "isolates".
  let web: number = 0;
  let isolates: number = 0;
  let wikiattrs: number = 0;
  let wikilinks: number = 0;
  let wikiembeds: number = 0;
  const attrTypes: Set<string> = new Set();
  const linkTypes: Set<string> = new Set();

  for (const mdPath of mdFilePaths) {
    const content: string = fs.readFileSync(mdPath, 'utf8');
    const scanResults: any[] = wikirefs.scan(content);

    if (scanResults.length === 0) {
      isolates++;
      continue;
    }
    web++;

    for (const data of scanResults) {
      if (data.kind === wikirefs.CONST.WIKI.ATTR) {
        const filenames: any[] = data.filenames || [];
        wikiattrs += filenames.length;
        const t: any = data.type?.[0];
        if (typeof t === 'string' && t.length > 0) { attrTypes.add(t); }
      } else if (data.kind === wikirefs.CONST.WIKI.LINK) {
        wikilinks += 1;
        const t: any = data.type?.[0];
        if (typeof t === 'string' && t.length > 0) { linkTypes.add(t); }
      } else if (data.kind === wikirefs.CONST.WIKI.EMBED) {
        wikiembeds += 1;
      }
    }
  }

  const doctypesObj: any = getDocTypes(payload.doctypeUri);
  const doctypes: number = doctypesObj ? Object.keys(doctypesObj).length : 0;

  const out: string = [
    'structure',
    '',
    formatCountLine('nodes', nodes),
    formatCountLine('tree', tree),
    formatCountLine('web', web),
    formatCountLine('orphans', orphans),
    formatCountLine('isolates', isolates),
    '',
    'references',
    '',
    formatCountLine('wikiattrs', wikiattrs),
    formatCountLine('wikilinks', wikilinks),
    formatCountLine('wikiembeds', wikiembeds),
    '',
    'types',
    '',
    formatCountLine('doctypes', doctypes),
    formatCountLine('attrtypes', attrTypes.size),
    formatCountLine('linktypes', linkTypes.size),
  ].join('\n');

  console.log(out);
}
