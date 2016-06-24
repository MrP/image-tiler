/*global jasmine*/
var fs = require('fs');
var execSync = require('child_process').execSync;
var rimraf = require('rimraf');
var compareImages = require('./compareImages.helper.js').compareImages;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;
var tmpDir = process.env.TMPDIR || '/tmp';
var tempDir = tmpDir + '/imagetiler_spec_' + process.pid;

describe('image-tiler cli', function () {
    beforeEach(function () {
        fs.mkdirSync(tempDir);
    });
    describe('When used on an image smaller than the tile size', function () {
        it('should output the same image', function (done) {
            execSync('node bin/image-tiler spec/small.png ' + tempDir + ' small_test_result_{z}_{x}_{y}.png');
            compareImages(tempDir + '/small_test_result_0_0_0.png', 'expected/small-test.png')
            .then(done);
        });
    });


    afterEach(function () {
        rimraf.sync(tempDir);
    });

});


