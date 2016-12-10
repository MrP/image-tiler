/*global expect*/
var compareImages = require('node-image-compare-promise').compareImages;

module.exports.expectImagesToBeTheSame = function expectImagesToBeTheSame(image1, image2) {
    return compareImages(image1, image2)
        .then(function (data) {
        	expect(data.misMatchPercentage).toBe('0.00');
        });
};
