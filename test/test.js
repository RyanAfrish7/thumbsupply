const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const SAMPLE_VIDEO = 'test/SampleVideo_1280x720_1mb.mp4';

describe('thumbsupply', () => {

    describe('#sha256()', () => {
        let thumbsupply;

        before(() => {
            thumbsupply = require('../')('9e4b60777853e39420e058c54e46b3b8');
        });

        it('should hash the file', done => {
            thumbsupply.sha256(SAMPLE_VIDEO)
                .then(hash => {
                    assert.equal(hash, 'f25b31f155970c46300934bda4a76cd2f581acab45c49762832ffdfddbcf9fdd');
                    done();
                })
                .catch(done);
        });

        after((done) => {
            fs.remove(path.join(require('os').homedir(), '.cache', '9e4b60777853e39420e058c54e46b3b8'), done);
        });

    });

    describe('#generateThumbnail()', () => {
        let thumbsupply;

        before(() => {
            thumbsupply = require('../')('9e4b60777853e39420e058c54e46b3b8');
        });

        it('should be creating the thumbnail', () => {
            return thumbsupply.generateThumbnail(SAMPLE_VIDEO);
        });

        after((done) => {
            return fs.remove(path.join(require('os').homedir(), '.cache', '9e4b60777853e39420e058c54e46b3b8'), done);
        });

    });

    describe('#lookupThumbnail()', () => {
        let thumbsupply;

        before(() => {
            thumbsupply = require('../')('9e4b60777853e39420e058c54e46b3b8');
            return thumbsupply.generateThumbnail(SAMPLE_VIDEO);
        });

        it('should lookup and fetch the thumbnail', () => {
            return thumbsupply.lookupThumbnail(SAMPLE_VIDEO);
        });

        it('should not lookup and fetch the expired thumbnail', done => {
            fs.utimesSync(SAMPLE_VIDEO, Date.now() / 1000, Date.now() / 1000 + 1);
            thumbsupply.lookupThumbnail(SAMPLE_VIDEO)
                .then(() => done(new Error('Expected Error not found')))
                .catch(() => done());
        });

        after((done) => {
            fs.remove(path.join(require('os').homedir(), '.cache', '9e4b60777853e39420e058c54e46b3b8'), done);
        });

    })
});