const ffmpeg = require("fluent-ffmpeg");

const ThumbnailSupplier = require("../thumb.js");

function ratioStringToParts(str) {
    return str.split(":").map(n => parseInt(n, 10));
}

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

                const stream = metadata.streams.find(
                    stream => stream.codec_type === "video"
                );

                const darString = stream.display_aspect_ratio;
                const sarString = stream.sample_aspect_ratio;

                // ffprobe returns aspect ratios of "0:1" or `undefined` if they're not specified.
                // https://trac.ffmpeg.org/ticket/3798
                if (darString && darString !== "0:1") {
                    // The DAR is specified so use it directly
                    const [widthRatioPart, heightRatioPart] = ratioStringToParts(darString);
                    const inverseDar = heightRatioPart / widthRatioPart;
                    resolve({
                        width: stream.width,
                        height: stream.width * inverseDar
                    });
                } else if (sarString && sarString !== "0:1") {
                    // DAR missing but SAR specified, calculate display resolution using SAR and sample resolution.
                    const [widthRatioPart, heightRatioPart] = ratioStringToParts(sarString);
                    const sar = widthRatioPart / heightRatioPart;
                    resolve({
                        width: stream.width * sar,
                        height: stream.height
                    });
                } else {
                    // SAR and DAR not specified so assume square pixels (use sample resolution as-is).
                    resolve({
                        width: stream.width,
                        height: stream.height
                    });
                }
            });
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