# neomura/png-to-phomena-m110

Command-line tool to convert PNG streams to streams which can be forwarded to Phomena M110 label printers.

[MIT licensed](./license.md).

## Dependencies

- NodeJS 14.15.3 or later.

## Installation/usage

### Version tracked to project-local package.json (recommended)

within a terminal in the same directory as the package.json:

`npm install --save-dev @neomura/png-to-phomena-m110`

then, to print to a file to the Phomena M110 label printer on serial port 1:

`npx neomura-png-to-phomena-m110 < path-to-file.png | /dev/ttyS1`

### Globally installed (not recommended)

within a terminal:

`npm install --global @neomura/png-to-phomena-m110`

then, to print to a file to the Phomena M110 label printer on serial port 1:

`neomura-png-to-phomena-m110 < path-to-file.png | /dev/ttyS1`
