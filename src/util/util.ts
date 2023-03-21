import fs from 'fs';
import path from 'path';

import { MD } from './const';

// save:
// process.cwd(), fs.readdirSync(process.cwd()

// regex

export function buildGlob(filenames: string[]) {
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
