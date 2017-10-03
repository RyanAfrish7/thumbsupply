class UnknownFiletypeError extends Error {
    constructor(file, mimetype, ...args) {
        super(...args);
        this.file = file;
        this.mimetype = mimetype;
    }
}

class ThumbnailExpiredError extends Error {
    constructor(thumbnail, ...args) {
        super(...args);
        this.thumbnail = thumbnail;
    }
}

module.exports = {
    UnknownFiletypeError,
    ThumbnailExpiredError
};