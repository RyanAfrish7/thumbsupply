const fs = require("fs-extra");
const mimetypes = require("mime-types");

const E = require("./thumb-errors.js");

class ThumbSupply {

    get _defaultOptions() {
        return {
            forceCreate: false,
            size: this.ThumbSize.LARGE
        };
    }

    get ThumbSize() {
        return Object.freeze({
            MEDIUM: {
                name: '240p',
                width: 240,
                height: 240
            },

            LARGE: {
                name: '480p',
                width: 480,
                height: 480
            }
        });
    }

    constructor() {
        this._thumbSuppliers = new Map();
        this._registerThumbSupplier("video/*", require("./thumbs/video-thumb"));
    }

    _registerThumbSupplier(mimetype, ThumbSupplier) {
        this._thumbSuppliers.set(mimetype, ThumbSupplier);
    }

    _fetchThumbnailSupplier(file, options) {
        const mime = options.mimetype || mimetypes.lookup(file);
        let Supplier;

        if (!mime) {
            throw new E.UnknownFiletypeError(file, undefined, "Unable to probe mimetype from filename");
        }

        if (this._thumbSuppliers.has(mime)) {
            Supplier = this._thumbSuppliers.get(mime);
        } else if (this._thumbSuppliers.has(mime.replace(/(.+\/)(.+)/, "$1*"))) {
            // regex to replace application/json -> application/*
            Supplier = this._thumbSuppliers.get(mime.replace(/(.+\/)(.+)/, "$1*"));
        } else {
            throw new E.UnknownFiletypeError(file, mime, "FileType has no associated ThumbnailSupplier");
        }

        return new Supplier(options);
    }

    generateThumbnail(file, options) {
        return new Promise((resolve, reject) => {
            options = Object.assign(this._defaultOptions, options || {});

            const supplier = this._fetchThumbnailSupplier(file, options);

            if (options.forceCreate) {
                supplier.createThumbnail(file)
                    .then(resolve)
                    .catch(reject);
            } else {
                this.lookupThumbnail(file, options)
                    .then(resolve)
                    .catch(() => {
                        supplier.createThumbnail(file)
                            .then(resolve)
                            .catch(reject);
                    });
            }
        });
    }

    lookupThumbnail(file, options) {
        return new Promise((resolve, reject) => {
            options = Object.assign(this._defaultOptions, options || {});

            fs.stat(file, (err, stats) => {
                if (err) return reject(err);

                const fileModifiedTime = stats.mtime;
                const supplier = this._fetchThumbnailSupplier(file, options);
                const thumbnailPath = supplier.getThumbnailLocation(file);

                fs.stat(thumbnailPath, (err, stats) => {
                    if (err) return reject(err);

                    if (stats.mtime.getTime() < fileModifiedTime.getTime()) {
                        reject(new E.ThumbnailExpiredError(thumbnailPath, "Thumbnail Expired"));
                    } else {
                        resolve(thumbnailPath);
                    }
                });
            });
        });
    }
}

module.exports = new ThumbSupply();