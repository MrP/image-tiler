/*global jasmine, expect*/
var fs = require('fs');
var tile = require('../index.js').tile;
var rimraf = require('rimraf');
var expectImagesToBeTheSame = require('./expectImagesToBeTheSame.helper.js').expectImagesToBeTheSame;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;
var tmpDir = process.env.TMPDIR || '/tmp';
var tempDir = tmpDir + '/tile_spec_' + process.pid;

describe('tile', function () {
    beforeEach(function () {
        fs.mkdirSync(tempDir);
    });
    describe('When used on an image smaller than the tile size', function () {
        it('should output the same image', function (done) {
            tile('spec/small.png', tempDir, 'small_test_result_{z}_{x}_{y}.png')
            .then(()=>expectImagesToBeTheSame(tempDir + '/small_test_result_0_0_0.png', 'spec/expected/small-test.png'))
            .then(done)
            .catch(done.fail);
        });
    });

    describe('When used on a tall image', function () {
        it('should work', function (done) {
            tile('spec/tall.png', tempDir, 'tall_test_result_{z}_{x}_{y}.png')
            .then(()=>expectImagesToBeTheSame(tempDir + '/tall_test_result_1_0_0.png', 'spec/expected/tall-test-1-0-0.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tall_test_result_1_0_1.png', 'spec/expected/tall-test-1-0-1.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tall_test_result_0_0_0.png', 'spec/expected/tall-test-0-0-0.png'))
            .then(done)
            .catch(done.fail);
        });
    });

    describe('When used on a wide image', function () {
        it('should work', function (done) {
            tile('spec/wide.jpg', tempDir, 'wide_test_result_{z}_{x}_{y}.png')
            .then(()=>expectImagesToBeTheSame(tempDir + '/wide_test_result_1_0_0.png', 'spec/expected/wide-test-1-0-0.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/wide_test_result_1_1_0.png', 'spec/expected/wide-test-1-1-0.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/wide_test_result_0_0_0.png', 'spec/expected/wide-test-0-0-0.png'))
            .then(done)
            .catch(done.fail);
        });
    });

    describe('When used with a small cell size that will make it have several rows and columns', function () {
        it('should work', function (done) {
            tile('spec/small.png', tempDir, 'smallTileSize/{z}/tile_{x}_{y}.png', {tileSize: 64})
            .then(()=>expectImagesToBeTheSame(tempDir + '/smallTileSize/1/tile_0_0.png', 'spec/expected/smallTileSize-test-1-0-0.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/smallTileSize/1/tile_0_1.png', 'spec/expected/smallTileSize-test-1-0-1.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/smallTileSize/1/tile_1_0.png', 'spec/expected/smallTileSize-test-1-1-0.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/smallTileSize/1/tile_1_1.png', 'spec/expected/smallTileSize-test-1-1-1.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/smallTileSize/0/tile_0_0.png', 'spec/expected/smallTileSize-test-0-0-0.png'))
            .then(done)
            .catch(done.fail);
        });
    });
    describe('When inverting the zoom level', function () {
        it('should work', function (done) {
            tile('spec/small.png', tempDir, 'smallTileSize/{z}/tile_{x}_{y}.png', {tileSize: 64, invertZoom: true})
            .then(()=>expectImagesToBeTheSame(tempDir + '/smallTileSize/1/tile_0_0.png', 'spec/expected/smallTileSize-test-0-0-0.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/smallTileSize/0/tile_0_0.png', 'spec/expected/smallTileSize-test-1-0-0.png'))
            .then(done)
            .catch(done.fail);
        });
    });
    describe('when tiling a larger image', function () {
        it('should work fine and not run out of memory', function (done) {
            tile('spec/a.jpeg', tempDir, 'tile_{z}_{x}_{y}.png', {invertZoom: true})
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_0_0_0.png', 'spec/expected/a/tile_0_0_0.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_0_9_12.png', 'spec/expected/a/tile_0_9_12.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_2_1_3.png', 'spec/expected/a/tile_2_1_3.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_4_0_0.png', 'spec/expected/a/tile_4_0_0.png'))
            .then(done)
            .catch(done.fail);
        });
    });
    describe('when tiling a big image', function () {
        it('should calculate zoom levels right', function (done) {
            tile('spec/big_image.png', tempDir, 'tile_{z}_{x}_{y}.png', {invertZoom: false})
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_0_0_0.png', 'spec/expected/big_image/tile_0_0_0.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_1_0_1.png', 'spec/expected/big_image/tile_1_0_1.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_2_1_1.png', 'spec/expected/big_image/tile_2_1_1.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_3_2_3.png', 'spec/expected/big_image/tile_3_2_3.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_4_13_11.png', 'spec/expected/big_image/tile_4_13_11.png'))
            .then(done)
            .catch(done.fail);
        });
    });
    describe('when tiling an image that is 1024x1024 pixels', function () {
        it('should not produce a bogus -1 zoom image', function (done) {
            tile('spec/1024.png', tempDir, 'tile_{z}_{x}_{y}.png', {invertZoom: false})
            .then(()=>expect(fs.existsSync(tempDir + '/tile_-1_0_0.png')).toBe(false))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_0_0_0.png', 'spec/expected/1024/tile_0_0_0.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_1_0_1.png', 'spec/expected/1024/tile_1_0_1.png'))
            .then(()=>expectImagesToBeTheSame(tempDir + '/tile_2_2_2.png', 'spec/expected/1024/tile_2_2_2.png'))
            // .then(()=>expectImagesToBeTheSame(tempDir + '/tile_2_3_2.png', 'spec/expected/1024/tile_2_3_2.png'))
            // .then(()=>expectImagesToBeTheSame(tempDir + '/tile_2_3_3.png', 'spec/expected/1024/tile_2_3_3.png'))
            .then(done)
            .catch(done.fail);
        });
    });
    afterEach(function () {
        rimraf.sync(tempDir);
    });

});


