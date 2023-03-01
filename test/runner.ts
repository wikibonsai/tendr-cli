// import assert from 'node:assert/strict';

// import fs from 'fs';
// import path from 'path';

// import type { CommandTestCase, TestHelpers } from './types';
// import { tendr } from '../src/lib/tendr';
// import { MD } from '../src/lib/const';


// // todo:
// //  - run tests through this common runner
// //  - 'helpers' is coming in as 'undefined'

// export const testCmd = (helpers: TestHelpers, test: CommandTestCase) => () => {
//   tendr.parse(test.cmd);
//   // in
//   assert.deepStrictEqual(tendr.args, test.args);
//   const cmd: any = tendr.commands.find((cmd) => cmd.name() === helpers.cmdName);
//   assert.deepStrictEqual(cmd.opts(), test.opts ? test.opts : {});
//   // out
//   assert.strictEqual(helpers.fakeConsoleLog.called, true);
//   if (helpers.fakeConsoleLog.called) {
//     assert.strictEqual(helpers.fakeConsoleLog.getCall(0).args[0], test.output);
//   } else if (helpers.fakeConsoleError.called) {
//     assert.strictEqual(helpers.fakeConsoleError.getCall(0).args[0], test.output);
//   } else {
//     console.error('console not called');
//     assert.fail();
//   }
//   // file changes (if there were any)
//   if (test.contents) {
//     for (const fname of Object.keys(test.contents)) {
//       const expdContent: string = test.contents[fname];
//       const testFilePath: string = path.join(helpers.fakeCwd, fname + MD);
//       if (!fs.existsSync(testFilePath)) {
//         console.error(`could not find file at: ${testFilePath}`);
//         assert.fail();
//       }
//       const actlContent: string = fs.readFileSync(testFilePath, 'utf8');
//       assert.strictEqual(expdContent, actlContent);
//     }
//   }
// };
