export class UnknownFileTypeError extends Error {
    readonly filePath: string;
    readonly mimeType: string;

    constructor(filePath: string, mimeType: string, message?: string) {
        super(message);

        this.filePath = filePath;
        this.mimeType = mimeType;
    }
}

export class ThumbnailExpiredError extends Error {
    readonly thumbnailPath: string;

    constructor(thumbnailPath: string, message?: string) {
        super(message);
        this.thumbnailPath = thumbnailPath;
    }
}
