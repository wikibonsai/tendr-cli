export interface TestHelpers {
  cmdName: string;
  fakeCwd: string;
  fakeConsoleLog: any;
  fakeConsoleError: any;
}

export interface CommandTestCase {
  // in
  input: string[];
  cmd: string[];
  args?: any;
  opts?: any;
  icontent?: string;                  // In-content
  // out
  output?: string;
  contents?: Record<string, string>; // [filename]: content
  ocontent?: string;                 // Out-content
}
