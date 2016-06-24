/*global expect*/
var resemble = require('node-resemble-js');

module.exports.compareImages = function compareImages(generatedImage, existingImage) {
    return new Promise(resolve => {
        resemble(generatedImage).compareTo('spec/' + existingImage).onComplete(function(data){
        	expect(data.misMatchPercentage).toBe('0.00');
        	expect(data.isSameDimensions).toBe(true);
        	resolve();
        });
    });
};
