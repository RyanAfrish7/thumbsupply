const ffmpeg = require("fluent-ffmpeg");

const ThumbnailSupplier = require("../thumb.js");

class VideoThumbnailSupplier extends ThumbnailSupplier {

    constructor(options) {
        super(options);
        this.timestamp = options.timestamp || "10%";
    }

    createThumbnail(video) {
        return new Promise((resolve, reject) => {
            const hash = ThumbnailSupplier.hashFile(video);

            ffmpeg(video)
                .on("end", () => resolve(super.getThumbnailLocation(video)))
                .on("error", reject)
                .screenshots({
                    size: `${this.size.width}x${this.size.height}`,
                    timestamps: [this.timestamp],
                    filename: ThumbnailSupplier.getThumbnailFileName(video),
                    folder: this.cacheDir
                });
        });
    }

    // FIXME thumbnails are stretched to square

    // ffmpeg.ffprobe(video, function(err, metadata) {
    //     console.dir(metadata);
    // });
}

module.exports = VideoThumbnailSupplier;