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
        const childProcess = spawn(`node`, [__dirname, ...args]);

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
  `neomura-phomemo-m110-png (0.0.0) - convert png data from standard input into a stream which can be forwarded to a phomemo m110 label printer.
  usage: neomura-phomemo-m110-png [options]
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
    let actualStdout = ``;
    let actualStderr = ``;
    let expectedStdout: Buffer;

    beforeAll(async () => {
      expectedStdout = await promises.readFile(join(__dirname, ...expected));

      await new Promise<void>((resolve, reject) => {
        const childProcess = spawn(`node`, [__dirname]);

        childProcess.stdout.setEncoding(`binary`);

        createReadStream(join(__dirname, ...input)).pipe(childProcess.stdin);

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
      expect(Buffer.from(actualStdout, `binary`)).toEqual(expectedStdout);
    });

    it(`generates the expected stderr`, () => {
      expect(actualStderr).toEqual(``);
    });
  });
}

validScenario(
  `valid`,
  [`tests`, `valid`, `input.png`],
  [`tests`, `valid`, `expected.bin`]
);

validScenario(
  `at width limit`,
  [`tests`, `at-width-limit`, `input.png`],
  [`tests`, `at-width-limit`, `expected.bin`]
);

validScenario(
  `at height limit`,
  [`tests`, `at-height-limit`, `input.png`],
  [`tests`, `at-height-limit`, `expected.bin`]
);

function invalidScenario(
  description: string,
  input: ReadonlyArray<string>,
  expected: RegExp
): void {
  describe(description, () => {
    let actualExitCode: null | number = null;
    let actualStderr = ``;

    beforeAll(async () => {
      await new Promise<void>((resolve, reject) => {
        const childProcess = spawn(`node`, [__dirname]);

        childProcess.stdout.setEncoding(`binary`);

        createReadStream(join(__dirname, ...input)).pipe(childProcess.stdin);

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
      expect(actualExitCode).toEqual(1);
    });

    it(`generates the expected stderr`, () => {
      expect(actualStderr).toMatch(expected);
    });
  });
}

invalidScenario(
  `empty`,
  [`tests`, `empty`, `input.png`],
  /^Error: Unexpected end of input\r?\n(?:\r\n|\n|.)*$/
);

invalidScenario(
  `non PNG`,
  [`tests`, `non-png`, `input.png`],
  /^Error: Invalid file signature\r?\n(?:\r\n|\n|.)*$/
);

invalidScenario(
  `width indivisible by 8`,
  [`tests`, `width-indivisible-by-8`, `input.png`],
  /^The PNG's width must be a multiple of 8\.\r?\n$/
);

invalidScenario(
  `width one over limit`,
  [`tests`, `width-1-over-limit`, `input.png`],
  /^The PNG's width cannot be greater than 524287\.\r?\n$/
);

invalidScenario(
  `width two over limit`,
  [`tests`, `width-2-over-limit`, `input.png`],
  /^The PNG's width cannot be greater than 524287\.\r?\n$/
);

invalidScenario(
  `height one over limit`,
  [`tests`, `height-1-over-limit`, `input.png`],
  /^The PNG's height cannot be greater than 65535\.\r?\n$/
);

invalidScenario(
  `height two over limit`,
  [`tests`, `height-2-over-limit`, `input.png`],
  /^The PNG's height cannot be greater than 65535\.\r?\n$/
);

invalidScenario(
  `transparent pixel`,
  [`tests`, `transparent-pixel`, `input.png`],
  /^The PNG cannot contain partially or fully transparent pixels\.\r?\n$/
);

invalidScenario(
  `semitransparent pixel`,
  [`tests`, `semitransparent-pixel`, `input.png`],
  /^The PNG cannot contain partially or fully transparent pixels\.\r?\n$/
);

invalidScenario(
  `invalid red channel in otherwise white pixel`,
  [`tests`, `invalid-red-channel-in-otherwise-white-pixel`, `input.png`],
  /^The PNG cannot contain pixels which are not black or white\.\r?\n$/
);

invalidScenario(
  `invalid red channel in otherwise black pixel`,
  [`tests`, `invalid-red-channel-in-otherwise-black-pixel`, `input.png`],
  /^The PNG cannot contain pixels which are not black or white\.\r?\n$/
);

invalidScenario(
  `invalid green channel in otherwise white pixel`,
  [`tests`, `invalid-green-channel-in-otherwise-white-pixel`, `input.png`],
  /^The PNG cannot contain pixels which are not black or white\.\r?\n$/
);

invalidScenario(
  `invalid green channel in otherwise black pixel`,
  [`tests`, `invalid-green-channel-in-otherwise-black-pixel`, `input.png`],
  /^The PNG cannot contain pixels which are not black or white\.\r?\n$/
);

invalidScenario(
  `invalid blue channel in otherwise white pixel`,
  [`tests`, `invalid-blue-channel-in-otherwise-white-pixel`, `input.png`],
  /^The PNG cannot contain pixels which are not black or white\.\r?\n$/
);

invalidScenario(
  `invalid blue channel in otherwise black pixel`,
  [`tests`, `invalid-blue-channel-in-otherwise-black-pixel`, `input.png`],
  /^The PNG cannot contain pixels which are not black or white\.\r?\n$/
);

describe(`when the standard output is not writable`, () => {
  let actualExitCode: null | number = null;
  let actualStderr = ``;

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      const childProcess = spawn(`node`, [__dirname]);

      childProcess.stdout.destroy();

      createReadStream(join(__dirname, `tests`, `valid`, `input.png`)).pipe(
        childProcess.stdin
      );

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
    expect(actualExitCode).toEqual(1);
  });

  it(`generates the expected stderr`, () => {
    expect(actualStderr).toMatch(
      /^(?:\r\n|\n|.)*\r?\n(?:Error: write EPIPE|Error: EPIPE: broken pipe, write)\r?\n(?:\r\n|\n|.)*$/
    );
  });
});
