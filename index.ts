#!/usr/bin/node

import { version, description, bin } from "./package.json";
import { PNG } from "pngjs";
import {
  parseCommandLineArguments,
  runMain,
} from "@neomura/js-command-line-helpers";

runMain(async () => {
  parseCommandLineArguments(
    `${Object.keys(bin)} (${version})`,
    `${description}`,
    {
      strings: {},
      integers: {},
    }
  );

  await new Promise<void>((resolve, reject) => {
    process.stdin
      .pipe(new PNG())
      .on(`parsed`, function () {
        if (this.width > 524287) {
          reject(`The PNG's width cannot be greater than 524287.`);
        }

        if (this.height > 65535) {
          reject(`The PNG's height cannot be greater than 65535.`);
        }

        if (this.width % 8 !== 0) {
          reject(`The PNG's width must be a multiple of 8.`);
        }

        const bytes = new Uint8Array(8 + (this.width / 8) * this.height);

        // ESC @.
        bytes[0] = 0x1b;
        bytes[1] = 0x40;

        // GS v 0.
        bytes[2] = 0x1d;
        bytes[3] = 0x76;
        bytes[4] = 0x30;
        bytes[5] = 0x00;

        // Width.
        bytes[6] = Math.floor(this.width / 8) % 256;
        bytes[7] = Math.floor(this.width / 8) / 256;

        // Height.
        bytes[8] = this.height % 256;
        bytes[9] = this.height / 256;

        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width / 8; x++) {
            let byte = 0;

            for (let bit = 0; bit < 8; bit++) {
              if (
                this.data[y * this.width * 4 + x * 32 + bit * 4 + 3] !== 255
              ) {
                reject(
                  `The PNG cannot contain partially or fully transparent pixels.`
                );
              }

              switch (this.data[y * this.width * 4 + x * 32 + bit * 4]) {
                case 0:
                  if (
                    this.data[y * this.width * 4 + x * 32 + bit * 4 + 1] !==
                      0 ||
                    this.data[y * this.width * 4 + x * 32 + bit * 4 + 2] !== 0
                  ) {
                    reject(
                      `The PNG cannot contain pixels which are not black or white.`
                    );
                  }

                  byte |= 128 >> bit;
                  break;

                case 255:
                  if (
                    this.data[y * this.width * 4 + x * 32 + bit * 4 + 1] !==
                      255 ||
                    this.data[y * this.width * 4 + x * 32 + bit * 4 + 2] !== 255
                  ) {
                    reject(
                      `The PNG cannot contain pixels which are not black or white.`
                    );
                  }
                  break;

                default:
                  reject(
                    `The PNG cannot contain pixels which are not black or white.`
                  );
              }
            }

            bytes[10 + (y * this.width) / 8 + x] = byte;
          }
        }

        process.stdout.write(Buffer.from(bytes), (err) => {
          if (err !== undefined) {
            reject(err);
          } else {
            resolve();
          }
        });
      })
      .on(`error`, reject);
  });
});
