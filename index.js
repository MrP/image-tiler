'use strict';
var execSync = require('child_process').execSync;
var sizeOf = require('image-size');
var mkdirp = require('mkdirp-promise');
var rimraf = require('rimraf-promise');
var fs = require('fs');
var path = require('path');

function tileLevel(inPath, outPath, zoom, tileSize, pattern, quality) {
    var dotExtension = pattern.replace(/.*(\.[^.]+)$/, '$1');
    var patternedFilename = pattern.replace(/\{z\}/, '' + zoom)
        .replace(/\{x\}/, '%[fx:page.x/' + tileSize + ']')
        .replace(/\{y\}/, '%[fx:page.y/' + tileSize + ']')
        .replace(/\.[^.]+$/, '');
    var patternedFilenameWithoutTheFilename = '';
    if (pattern.indexOf(path.sep) > 0) {
        patternedFilenameWithoutTheFilename = pattern.replace(new RegExp(path.sep+'[^'+path.sep+']*$'), '')
        .replace(/\{z\}/, '' + zoom);
    }
    return mkdirp(outPath + path.sep + patternedFilenameWithoutTheFilename)
    .then(()=>{
        var command = 'convert ' + inPath +
            ' -crop ' + tileSize + 'x' + tileSize +
            ' -set filename:tile "' + patternedFilename + '"' +
            ' -quality ' + quality + ' +repage +adjoin' +
            ' "' + outPath + '/%[filename:tile]' + dotExtension + '"' ;
        execSync(command);
    });
}

function imageSmallerThanTile(path, tileSize) {
    var size = sizeOf(path);
    return size.height < tileSize && size.width < tileSize;
}

function tileRec(inPath, outPath, zoom, tileSize, tempDir, pattern, zoomToDisplay, invertZoom, quality) {
    var inPathMpc = tempDir + '/temp_level_' + zoom + '.mpc';
    var inPathCache = tempDir + '/temp_level_' + zoom + '.cache';
    execSync('convert ' + inPath + ' ' + inPathMpc);
    return tileLevel(inPathMpc, outPath, zoomToDisplay, tileSize, pattern, quality)
        .then(function () {
            if (!imageSmallerThanTile(inPath, tileSize)) {
                var newZoom = zoom + 1;
                var newZoomToDisplay = zoomToDisplay + 1;
                if (!invertZoom) {
                    newZoomToDisplay = zoomToDisplay - 1;
                }
                var newInPath = tempDir + '/temp_level_' + zoom + '.png';
                execSync('convert ' + inPathMpc + ' -resize 50% -quality ' + quality + ' ' + newInPath);
                fs.unlinkSync(inPathMpc);
                fs.unlinkSync(inPathCache);
                return tileRec(newInPath, outPath, newZoom, tileSize, tempDir, pattern, newZoomToDisplay, invertZoom, quality);
            } else {
                fs.unlinkSync(inPathMpc);
                fs.unlinkSync(inPathCache);
            }
        });
}

module.exports.tile = function (inPath, outPath, pattern, options) {
    options = options || {};
    var tileSize = options.tileSize || 256;
    var tmpDir = options.tmpDir || process.env.TMPDIR || '/tmp';
    var tempDir = tmpDir + '/image-tiler_' + process.pid;
    var zoom = 0;
    var zoomToDisplay = 0;
    var quality = options.quality || 100;
    if (!options.invertZoom) {
        var size = sizeOf(inPath);
        var halvingsWidth = Math.ceil(Math.log2(Math.ceil(size.width / tileSize)));
        var halvingsheight = Math.ceil(Math.log2(Math.ceil(size.height / tileSize)));
        zoomToDisplay = Math.max(halvingsWidth, halvingsheight);
    }
    return mkdirp(tempDir)
        .then(()=>tileRec(inPath, outPath, zoom, tileSize, tempDir, pattern, zoomToDisplay, options.invertZoom, quality))
        .then(()=>rimraf(tempDir));
};
