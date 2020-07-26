export class UnknownFileTypeError extends Error {
    readonly filePath: string;
    readonly mimeType: string;

    constructor(filePath: string, mimeType: string, ...args: any[]) {
        super(...args);

        this.filePath = filePath;
        this.mimeType = mimeType;
    }
}

export class ThumbnailExpiredError extends Error {
    readonly thumbnailPath: string;

    constructor(thumbnailPath: string, ...args: any[]) {
        super(...args);
        this.thumbnailPath = thumbnailPath;
    }
}
