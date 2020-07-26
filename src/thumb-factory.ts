import { ThumbSize } from "./thumb-size";

export interface FileMetadata {
    filePath: string;
    mimeType?: string;
}

export interface ThumbConfig {
    size: ThumbSize;
    filePath: string;
}

export abstract class ThumbFactory {
    abstract doesSupportFileFormat(fileMetadata: FileMetadata): boolean;
    async abstract generateThumbnail(fileMetadata: FileMetadata, thumbConfig: ThumbConfig): Promise<string>;
}
