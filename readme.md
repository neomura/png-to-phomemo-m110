# neomura/png-to-phomemo-m110

Command-line tool to convert PNG streams to streams which can be forwarded to Phomemo M110 label printers.

[MIT licensed](./license.md).

## Dependencies

- NodeJS 14.15.3 or later.

## Installation/usage

### Version tracked to project-local package.json (recommended)

Within a terminal in the same directory as the package.json:

`npm install --save-dev @neomura/png-to-phomemo-m110`

Then, to print to a file to the Phomemo M110 label printer on serial port 1:

`npx neomura-png-to-phomemo-m110 < path-to-file.png | /dev/ttyS1`

### Globally installed (not recommended)

Within a terminal:

`npm install --global @neomura/png-to-phomemo-m110`

Then, to print to a file to the Phomemo M110 label printer on serial port 1:

`neomura-png-to-phomemo-m110 < path-to-file.png | /dev/ttyS1`
