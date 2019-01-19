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

            this.getVideoDimension(video)
                .then(this.getOptimalThumbnailResolution.bind(this))
                .then(res => {
                    ffmpeg(video)
                        .on("end", () => resolve(super.getThumbnailLocation(video)))
                        .on("error", reject)
                        .screenshots({
                            size: `${res.width}x${res.height}`,
                            timestamps: [this.timestamp],
                            filename: ThumbnailSupplier.getThumbnailFileName(video),
                            folder: this.cacheDir
                        });
                })
                .catch(err => {
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
        });
    }

    getVideoDimension(video) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(video, (err, metadata) => {
                if (err) return reject(err);
                resolve({
                    width: metadata.streams[0].width,
                    height: metadata.streams[0].height
                });
            })
        });
    }

    getOptimalThumbnailResolution(videoDimension) {
        if(videoDimension.width > videoDimension.height) {
            return {
                width: this.size.width,
                height: Math.round(this.size.width * videoDimension.height / videoDimension.width)
            }
        } else {
            return {
                width: Math.round(this.size.height * videoDimension.width / videoDimension.height),
                height: this.size.height
            }
        }
    }
}

module.exports = VideoThumbnailSupplier;