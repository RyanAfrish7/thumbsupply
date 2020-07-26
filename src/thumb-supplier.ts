import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import * as fs from "fs";
import * as url from "url";

import { ThumbSize, ThumbSizes } from "./thumb-size";
import { ThumbFactory, FileMetadata } from "./thumb-factory";
import { UnknownFileTypeError, ThumbnailExpiredError } from "./errors";

export interface ThumbSupplierOptions {
    forceCreate: boolean;
    size: ThumbSize;
    cacheDir?: string;
    mimeType?: string;
}

const defaultOptions: ThumbSupplierOptions = {
    forceCreate: false,
    size: ThumbSizes.LARGE,
};

export class ThumbSupplier {
    private factories: ThumbFactory[] = [];
    private hashFn = () => crypto.createHash("sha256");

    private getThumbnailFilePath(filePath: string, cacheDir: string) {
        const uri = url.pathToFileURL(filePath).toString();
        return path.join(cacheDir, `${this.hashFn().update(uri).digest('hex')}.png`);
    }

    public registerFactory(factory: ThumbFactory) {
        this.factories.push(factory);
    }

    public getFactory(fileMetadata: FileMetadata) {
        return this.factories.find(factory => factory.doesSupportFileFormat(fileMetadata));
    }
    
    public async generateThumbnail(filePath: string, options?: Partial<ThumbSupplierOptions>): Promise<string> {
        const opts = {
            ...defaultOptions,
            ...options,
        };

        const fileMetadata: FileMetadata = {
            filePath,
            mimeType: options?.mimeType,
        };

        const factory = this.getFactory(fileMetadata);

        if (factory == null) {
            throw new UnknownFileTypeError(filePath, "File format is not recognized by any of the registered factories");
        }

        const cacheDir = opts.cacheDir ?? path.join(os.homedir(), ".cache", "thumbsupply", opts.size.name);
        const thumbnailFilePath = this.getThumbnailFilePath(filePath, cacheDir);

        if (options?.forceCreate) {
            return await factory.generateThumbnail(fileMetadata, {
                filePath: thumbnailFilePath,
                size: opts.size,
            });
        } else {
            try {
                return await this.lookupThumbnail(thumbnailFilePath);
            } catch (e) {
                return await factory.generateThumbnail(fileMetadata, {
                    filePath: thumbnailFilePath,
                    size: opts.size,
                });
            }
        }
    }

    async lookupThumbnail(filePath: string, options?: Partial<ThumbSupplierOptions>): Promise<string> {
        const opts = {
            ...defaultOptions,
            ...options,
        };

        const fileMetadata: FileMetadata = {
            filePath,
            mimeType: options?.mimeType,
        };

        const cacheDir = opts.cacheDir ?? path.join(os.homedir(), ".cache", "thumbsupply", opts.size.name);
        const thumbnailFilePath = this.getThumbnailFilePath(filePath, cacheDir);

        const fileModifiedTime = (await fs.promises.stat(filePath)).mtime;
        const thumbnailFileModifiedTime = (await fs.promises.stat(thumbnailFilePath)).mtime;

        if (thumbnailFileModifiedTime.getTime() < fileModifiedTime.getTime()) {
            throw new ThumbnailExpiredError(thumbnailFilePath, "Thumbnail Expired");
        }

        return thumbnailFilePath;
    }
}
