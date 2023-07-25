export interface TestMocks {
  fakeProcessCwd: any;
  fakeConsoleLog?: any;
  fakeConsoleWarn?: any;
  fakeConsoleError?: any;
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
}
