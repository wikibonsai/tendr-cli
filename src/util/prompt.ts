import readlineSync from 'readline-sync';


export const PROMPT_ABORT: string = '🛑 aborted';
// commented out: npm cli already provides this
// export const PROMPT_DONE: string = '✨ done';

export function abort(): void {
  console.log(PROMPT_ABORT);
}

export function confirm(action: string): boolean {
  /* eslint-disable indent */
  return readlineSync.question(`are you sure you want to ${action}? [y/n]\n`)
                     .toLowerCase()
                     .startsWith('y');
  /* eslint-enable indent */
}

// commented out: npm cli already provides this
// mostly for commands that perform non-read or display operations
// export function done(): void {
//   console.log(PROMPT_DONE);
// }
