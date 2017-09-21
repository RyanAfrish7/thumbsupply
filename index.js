const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const _ = require("lodash");
const ffmpeg = require("fluent-ffmpeg");
const fileUrl = _.bind(require('file-url'), null, _, {resolve: false});

module.exports = function (appId) {

    const thumbfactory = {};

    thumbfactory.appId = appId;
    thumbfactory.thumbCacheDir = path.join(os.homedir(), ".cache", appId, "thumbsupply");
    thumbfactory._defaultOptions = {
        width: 320,
        height: 240,
        timestamp: "10%"
    };

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
            options = _.defaults(options, thumbfactory._defaultOptions);

            options = {
                size: `${options.width}x${options.height}`,
                timestamps: [options.timestamp],
                filename: `${hash}-%r.png`,
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
            options = _.defaults(options, thumbfactory._defaultOptions);

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