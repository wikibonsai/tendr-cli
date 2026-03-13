export interface TestMocks {
  fakeProcessCwd: any;
  fakeConsoleLog?: any;
  fakeConsoleWarn?: any;
  fakeConsoleError?: any;
  fakeWriteFile?: any;
  testCwd: string;
  testFilePath?: string;
}

export interface CommandTestCase {
  // in
  input: string[];
  cmd: string[];
  args?: any;
  opts?: any;
  icontent?: string;                  // In-content
  // out
  confirm?: string;                   // the text displayed to user to confirm command execution
  aborted?: boolean;                  // whether user aborted the command
  warn?: string;                      // warning msg to display to user
  error?: string;                     // error msg to display to user
  output?: string;
  contents?: Record<string, string>;  // [filename]: content
  ocontent?: string;                  // Out-content
  // seed-specific assertions
  logIncludes?: { index: number; text: string }[];  // console.log assertions by call index
  logLastIncludes?: string;                          // last console.log call includes text
  writeFile?: { filename: string; content: string }; // assert fs.writeFileSync call
  writeFileExcludes?: string[];                       // strings that must NOT be in file content
}
