# neomura/png-to-phomemo-m110

Command-line tools to generate streams which can be forwarded to Phomemo M110 label printers.

[MIT licensed](./license.md).

## Dependencies

- NodeJS 14.15.3 or later.

## Installation/usage

PNG files fed into the application must be fully opaque and black and white.  The unit appears to be 203DPI.  Images will be placed in the top right corner of a label if they do not fill it.  As the included labels are 40x30mm, this makes for approximately 320x240.

Ensure that the COM port is set to "raw" mode to prevent data corruption (example here for COM1):

`stty -F /dev/ttyS1 115200 raw`

### Version tracked to project-local package.json (recommended)

Within a terminal in the same directory as the package.json:

`npm install --save-dev @neomura/phomemo-m110`

Then, to print to a file to the Phomemo M110 label printer on serial port 1:

`npx neomura-phomemo-m110-png < path-to-file.png > /dev/ttyS1`

### Globally installed (not recommended)

Within a terminal:

`npm install --global @neomura/phomemo-m110`

Then, to print to a file to the Phomemo M110 label printer on serial port 1:

`neomura-phomemo-m110-png < path-to-file.png > /dev/ttyS1`
