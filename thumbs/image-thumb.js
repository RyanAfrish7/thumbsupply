const imagemagick = require("imagemagick");
const { promisify } = require("util");
const convert = promisify(imagemagick.convert)

const ThumbnailSupplier = require("../thumb.js");

class ImageThumbnailSupplier extends ThumbnailSupplier {
    constructor(options) {
        super(options);
    }

    createThumbnail(image) {
        return new Promise((resolve, reject) => {
            const thumbnail = super.getThumbnailLocation(image);

            convert([image + "[0]", '-resize', `${this.size.height}x${this.size.width}`, thumbnail]).then(() => {
                resolve(thumbnail);
            }).catch(err => {
                reject(err);
            });
        })
    }
}

module.exports = ImageThumbnailSupplier;