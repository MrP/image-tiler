# image-tiler
Create zoom tile pyramids from a large image.  There are other packages very similar to this one, but none did exactly what I needed, so I made mine.

## Installation
You need imagemagick installed.  In ubuntu, you can install it like this:

    sudo apt-get update
    sudo apt-get install imagemagick

Then

    npm install image-tiler --save

## Usage
Include it like this:

    var tile = require('image-tiler').tile;



For example:

    //index.js
    var tile = require('image-tiler').tile;

    var tilePromise = tile('input/image.png', 'output/folder/', 'save_pattern_{z}/tile_{x}_{z}.png');
    tilePromise.then(() => console.log('Finished.'))
    .catch((error) => console.log('Error', error));
    // Output tiles will look like: output/folder/save_pattern_0/tile_0_0.png etc.


## Parameters
The `tile` function accepts the following parameters:

    tile(inPath, outPath, pattern, [options]);

`inPath` is the path and filename of the large image you want to slice.  The format will be deduced from the filename, and it accepts any format that ImageMagick accepts.  .jpeg, .png, etc.

`outPath` is a path to a directory where the output tiles will be saved.

`pattern` describes the structure and file names of the tile files. `{z}`, `{x}`, `{y}` will be replaced with the file's values. The extension of the pattern will determine the image format.  Supported formats are any supported by ImageMagick.  .jpeg, .png, etc.  You can have directories or not, but only for the zoom level.  E.g. `zoom-{z}/tile-{y}_{x}.png` is OK, but `{z}/{x}/{y}.png` is not.

`options` is an optional object with the following optional properties:

`options.tmpDir` a path to the directory where `tile` will write intermediate files.  Defaults to process.env.TMPDIR (usually /tmp) or /tmp

`options.tileSize` defaults to 256

`options.zeroZoomOut` false by default.  Controls whether zoom levels go from 0 (one tile, all zoomed out) to N (original scale) or the opposite (default).