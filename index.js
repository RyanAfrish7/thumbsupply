const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const _fileUrl = require('file-url');
const fileUrl = file => {
    return _fileUrl(file, {resolve: false});
};

module.exports = function (appId) {

    const thumbfactory = {};
    const defaultOptions = {
        width: 320,
        height: 240,
        timestamp: "10%"
    };

    thumbfactory.appId = appId;
    thumbfactory.thumbCacheDir = path.join(os.homedir(), ".cache", appId, "thumbsupply");

    fs.ensureDirSync(thumbfactory.thumbCacheDir);

    thumbfactory.emptyCache = () => {
        return new Promise((resolve, reject) => {
            fs.remove(thumbCacheDir, err => {
                if(err) return reject(err);
                resolve();
            });
        });
    };

    thumbfactory.sha256 = file => {
        const hash = crypto.createHash("sha256");
        hash.update(file);
        return hash.digest('hex');
    };

    thumbfactory.createThumbnail = (video, options) => {
        return new Promise((resolve, reject) => {
            const hash = thumbfactory.sha256(fileUrl(video));

            options = Object.assign(defaultOptions, options);

            options = {
                size: `${options.width}x${options.height}`,
                timestamps: [options.timestamp],
                filename: `${hash}-${options.width}x${options.height}.png`,
                folder: thumbfactory.thumbCacheDir
            };

            ffmpeg(video)
                .on("end", () => resolve(path.join(thumbfactory.thumbCacheDir, options.filename)))
                .on("error", reject)
                .screenshots(options);
        });
    };

    thumbfactory.generateThumbnail = (video, options) => {
        return new Promise((resolve, reject) => {
            if(options && options.forceCreate) {
                thumbfactory.createThumbnail(video, options)
                    .then(resolve)
                    .catch(reject);
            } else {
                thumbfactory.lookupThumbnail(video, options)
                    .then(resolve)
                    .catch(() => {
                        thumbfactory.createThumbnail(video, options)
                            .then(resolve)
                            .catch(reject);
                    });
            }
        });
    };

    thumbfactory.lookupThumbnail = (video, options) => {
        return new Promise((resolve, reject) => {
            options = Object.assign(defaultOptions, options);

            fs.stat(video, (err, stats) => {
                if (err) return reject(err);

                const videoModifiedTime = stats.mtime;
                const hash = thumbfactory.sha256(fileUrl(video));
                const thumbnailPath = path.join(thumbfactory.thumbCacheDir, `${hash}-${options.width}x${options.height}.png`);

                fs.stat(thumbnailPath, (err, stats) => {
                    if (err) return reject(err);

                    if (stats.mtime.getTime() < videoModifiedTime.getTime()) {
                        // FIXME throw error with the expired thumbnail
                        reject(new Error("Thumbnail Expired"));
                    } else {
                        resolve(thumbnailPath);
                    }
                });
            });
        })
    };

    return thumbfactory;
};