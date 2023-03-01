export interface TestHelpers {
  cmdName: string;
  fakeCwd: string;
  fakeConsoleLog: any;
  fakeConsoleError: any;
}

export interface CommandTestCase {
  // in
  cmd: string[];
  args: string[];
  opts?: any;
  // out
  output: string;
  contents?: Record<string, string>; // [filename]: content
}