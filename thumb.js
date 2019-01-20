const path = require("path");
const os = require("os");

const fileUrl = require('file-url');
const crypto = require('crypto');
const fs = require('fs-extra');

class ThumbnailSupplier {

    static get filetype() {
        return "png";
    }

    static hashFile(file) {
        const uri = fileUrl(file, {resolve: true});
        const hash = crypto.createHash("sha256");
        hash.update(uri);

        return hash.digest('hex');
    }

    static getThumbnailFileName(file) {
        return `${ThumbnailSupplier.hashFile(file)}.${ThumbnailSupplier.filetype}`;
    }

    constructor(options) {
        this.size = options.size;
        this.cacheDir = options.cacheDir || path.join(os.homedir(), ".cache", "thumbsupply", this.size.name);
        fs.ensureDirSync(this.cacheDir);
    }

    createThumbnail(file) {
        throw new ReferenceError('Method not implemented');
    }

    getThumbnailLocation(file) {
        return path.join(this.cacheDir, ThumbnailSupplier.getThumbnailFileName(file));
    }
}

module.exports = ThumbnailSupplier;