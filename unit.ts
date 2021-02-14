import { promises, createReadStream } from "fs";
import { join } from "path";
import { spawn } from "cross-spawn";

function helpTextScenario(
  description: string,
  args: ReadonlyArray<string>,
  exitCode: number,
  stdout: string,
  stderr: string
): void {
  describe(description, () => {
    let actualExitCode: null | number = null;
    let actualStdout = ``;
    let actualStderr = ``;

    beforeAll(async () => {
      await new Promise<void>((resolve, reject) => {
        const childProcess = spawn(`node`, [`.`, ...args]);

        childProcess.stdout.on(`data`, (data) => {
          actualStdout += data;
        });

        childProcess.stderr.on(`data`, (data) => {
          actualStderr += data;
        });

        childProcess.on(`close`, (code) => {
          actualExitCode = code;
          resolve();
        });

        childProcess.on(`error`, reject);
      });
    });

    it(`returns the expected exit code`, () => {
      expect(actualExitCode).toEqual(exitCode);
    });

    it(`generates the expected stdout`, () => {
      expect(actualStdout).toEqual(stdout);
    });

    it(`generates the expected stderr`, () => {
      expect(actualStderr).toEqual(stderr);
    });
  });
}

helpTextScenario(
  `help`,
  [`--help`],
  0,
  `neomura-png-to-phomena-m110 (0.0.0) - Command-line tool to convert PNG streams to streams which can be forwarded to Phomena M110 label printers.
  usage: neomura-png-to-phomena-m110 (0.0.0) [options]
  options:
    -h, --help, /?: display this message
`,
  ``
);

function validScenario(
  description: string,
  input: ReadonlyArray<string>,
  expected: ReadonlyArray<string>
): void {
  describe(description, () => {
    let actualExitCode: null | number = null;
    let actualStdout: number[] = [];
    let actualStderr = ``;
    let expectedStdout: Buffer;

    beforeAll(async () => {
      expectedStdout = await promises.readFile(join(...expected));

      await new Promise<void>((resolve, reject) => {
        const childProcess = spawn(`node`, [`.`]);

        createReadStream(join(...input)).pipe(childProcess.stdin);

        childProcess.stdout.on(`data`, (data) => {
          actualStdout += data;
        });

        childProcess.stderr.on(`data`, (data) => {
          actualStderr += data;
        });

        childProcess.on(`close`, (code) => {
          actualExitCode = code;
          resolve();
        });

        childProcess.on(`error`, reject);
      });
    });

    it(`returns the expected exit code`, () => {
      expect(actualExitCode).toEqual(0);
    });

    it(`generates the expected stdout`, () => {
      expect(actualStdout).toEqual(expectedStdout);
    });

    it(`generates the expected stderr`, () => {
      expect(actualStderr).toEqual(`expectedStdout`);
    });
  });
}

validScenario(
  `valid`,
  [`tests`, `valid`, `input.png`],
  [`tests`, `valid`, `expected.bin`]
);

// todo invalid scenarios
