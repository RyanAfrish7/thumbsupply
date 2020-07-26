import * as assert from "assert";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { imageSize } from "image-size";

import thumbsupply, { ThumbSizes } from "../src";

const SAMPLE_VIDEO = "test/SampleVideo_1280x720_1mb.mp4";
const SAR1 = "test/sar1.mp4";
const SAR2 = "test/sar2.mp4";
const SAR3 = "test/sar3.mp4";
const SAR4 = "test/sar4.mp4";
const LOOKUP_TIMEOUT = 60;

function testResolution(filePath: string, expectedSize: ({ width: number, height: number }), done: Function) {
    try {
        const size = imageSize(filePath);
        if (size.width === undefined || size.height === undefined) {
            throw new Error("Size is undefined");
        }

        assert.ok(Math.abs(size.width - expectedSize.width) <= 1);
        assert.ok(Math.abs(size.height - expectedSize.height) <= 1);
        if (done) done();
    }
    catch (e) {
        if (done) done(e);
        else throw e;
    }
}

function assertResolutionRatio(filePath: string, expectedRatio: number, done: Function) {
    try {
        const size = imageSize(filePath);
        if (size.width === undefined || size.height === undefined) {
            throw new Error("Size is undefined");
        }

        assert.strictEqual(
            size.width / size.height,
            expectedRatio,
            "ratio does not match expected"
        );
        if (done) done();
    } catch (e) {
        if (done) done(e);
        else throw e;
    }
}

describe("thumbsupply", () => {
    describe("#generateThumbnail()", () => {
        let createdThumbnail: string;

        it("should be creating the thumbnail", done => {
            thumbsupply.generateThumbnail(SAMPLE_VIDEO, {
                forceCreate: true
            })
                .then((thumbnail: string) => {
                    createdThumbnail = thumbnail;
                    testResolution(thumbnail, {
                        width: 480,
                        height: 270
                    }, done);
                })
                .catch(done);
        });

        it("should create the thumbnail at configured directory", done => {
            const cacheDir = path.join(os.homedir(), "tmp", "mySecretThumbs");

            thumbsupply.generateThumbnail(SAMPLE_VIDEO, { cacheDir })
                .then((thumbnail: string) => {
                    createdThumbnail = thumbnail;
                    assert.ok(createdThumbnail.includes(cacheDir));
                    done();
                })
                .catch(done);
        });

        it("should be creating the thumbnail of requested resolution", done => {
            thumbsupply.generateThumbnail(SAMPLE_VIDEO, {
                size: ThumbSizes.MEDIUM
            })
                .then((thumbnail: string) => {
                    createdThumbnail = thumbnail;
                    testResolution(thumbnail, {
                        width: 240,
                        height: 135
                    }, done);
                })
                .catch(done);
        });
          
        it("should create the thumbnail using the aspect ratio configured in the file (sar1.mp4)", done => {
            thumbsupply
                .generateThumbnail(SAR1)
                .then((thumbnail: string) => {
                    createdThumbnail = thumbnail;
                    assertResolutionRatio(thumbnail, 16 / 9, done);
                })
                .catch(done);
        });
          
        it("should create the thumbnail using the aspect ratio configured in the file (sar2.mp4)", done => {
            thumbsupply
                .generateThumbnail(SAR2)
                .then((thumbnail: string) => {
                    createdThumbnail = thumbnail;
                    assertResolutionRatio(thumbnail, 1 / 2, done);
                })
                .catch(done);
        });

        it("should create the thumbnail using the aspect ratio configured in the file (sar3.mp4)", done => {
            thumbsupply
                .generateThumbnail(SAR3)
                .then((thumbnail: string) => {
                    createdThumbnail = thumbnail;
                    assertResolutionRatio(thumbnail, 1 / 2, done);
                })
                .catch(done);
        });
          
        it("should create the thumbnail using the aspect ratio configured in the file (sar4.mp4)", done => {
            thumbsupply
                .generateThumbnail(SAR4)
                .then((thumbnail: string) => {
                    createdThumbnail = thumbnail;
                    assertResolutionRatio(thumbnail, 5 / 4, done);
                })
                .catch(done);
        });

        afterEach((done) => {
            fs.unlink(createdThumbnail, done);
        });
    });

    describe("#lookupThumbnail()", function () {
        let createdThumbnail: string;

        before(() => {
            return thumbsupply.generateThumbnail(SAMPLE_VIDEO)
                .then((thumbnail: string) => createdThumbnail = thumbnail);
        });

        it("should lookup and fetch the thumbnail", () => {
            this.timeout(LOOKUP_TIMEOUT);
            return thumbsupply.lookupThumbnail(SAMPLE_VIDEO);
        });

        it("should not lookup and fetch the expired thumbnail", function (done) {
            this.timeout(LOOKUP_TIMEOUT);
            fs.utimesSync(SAMPLE_VIDEO, Date.now() / 1000, Date.now() / 1000 + 1);

            thumbsupply.lookupThumbnail(SAMPLE_VIDEO)
                .then(() => done(new Error("Expected Error not found")))
                .catch(() => done());
        });

        after((done) => {
            fs.unlink(createdThumbnail, done);
        });
    });
});
