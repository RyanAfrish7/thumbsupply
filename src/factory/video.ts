import { FileMetadata, ThumbFactory, ThumbConfig } from "../thumb-factory";
import mimeTypes from "mime-types";
import ffmpeg from "fluent-ffmpeg";
import { ThumbSize } from "../thumb-size";
import * as path from "path";
import fs from "fs";

function ratioStringToParts(ratioString: string) {
    return ratioString.split(":").map(n => parseInt(n, 10));
}

interface VideoDimension {
    width: number;
    height: number;
}

export class VideoThumbFactory extends ThumbFactory {
    lastError?: string;

    public doesSupportFileFormat(fileMetadata: FileMetadata): boolean {
        const mimeType = fileMetadata.mimeType ?? mimeTypes.lookup(fileMetadata.filePath);
        
        if (mimeType === false) {
            return false;
        }

        return mimeType.startsWith("video/");
    }
    
    public async generateThumbnail(fileMetadata: FileMetadata, thumbConfig: ThumbConfig): Promise<string> {
        let { width, height } = thumbConfig.size;

        try { // try to maintain aspect ratio
            const videoDimension = await this.getVideoDimension(fileMetadata.filePath);
            ({ width, height } = this.getOptimalThumbnailResolution(videoDimension, { width, height }));
        } catch (error) {
            this.lastError = error;
        }

        await fs.promises.mkdir(path.dirname(thumbConfig.filePath), { recursive: true });

        const timestamp = "10%"; // TODO: explore smart ways to pick a timestamp

        return new Promise((resolve, reject) => {
            ffmpeg(fileMetadata.filePath)
                .on("end", () => resolve(thumbConfig.filePath))
                .on("error", reject)
                .screenshot({
                    size: `${width}x${height}`,
                    timestamps: [timestamp],
                    filename: path.basename(thumbConfig.filePath),
                    folder: path.dirname(thumbConfig.filePath),
                })
        });
    }

    private getVideoDimension(filePath: string): Promise<VideoDimension> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) return reject(err);

                const stream = metadata.streams.find(
                    stream => stream.codec_type === "video"
                );

                if (stream === undefined) {
                    reject(new Error("Cannot find a video stream"));
                    return;
                }

                const darString = stream.display_aspect_ratio;

                // ffprobe returns aspect ratios of "0:1" or `undefined` if they're not specified.
                // https://trac.ffmpeg.org/ticket/3798
                if (darString && darString !== "0:1") {
                    // The DAR is specified so use it directly
                    const [widthRatioPart, heightRatioPart] = ratioStringToParts(darString);
                    const inverseDar = heightRatioPart / widthRatioPart;

                    if (stream.width) {
                        resolve({
                            width: stream.width,
                            height: stream.width * inverseDar,
                        });
                    } else {
                        reject(new Error("Cannot detect video resolution"));
                    }
                } else {
                    // DAR not specified so assume square pixels (use sample resolution as-is).
                    if (stream.width && stream.height) {
                        resolve({
                            width: stream.width,
                            height: stream.height
                        });
                    } else {
                        reject(new Error("Cannot detect video resolution"));
                    }
                }
            });
        });
    }

    private getOptimalThumbnailResolution(videoDimension: VideoDimension, size: Pick<ThumbSize, 'width' | 'height'>) {
        if(videoDimension.width > videoDimension.height) {
            return {
                width: size.width,
                height: Math.round(size.width * videoDimension.height / videoDimension.width)
            }
        } else {
            return {
                width: Math.round(size.height * videoDimension.width / videoDimension.height),
                height: size.height,
            }
        }
    }
}
