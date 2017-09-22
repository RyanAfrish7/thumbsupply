const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const SAMPLE_VIDEO = 'test/SampleVideo_1280x720_1mb.mp4';

describe('thumbsupply', () => {

    describe('#generateThumbnail()', () => {
        let thumbsupply;

        before(() => {
            thumbsupply = require('../')('9e4b60777853e39420e058c54e46b3b8');
        });

        it('should be creating the thumbnail', done => {
            thumbsupply.generateThumbnail(SAMPLE_VIDEO)
                .then(thumbnail => fs.stat(thumbnail, done))
                .catch(done);
        });

        it('should be creating the thumbnail as specified', done => {
            thumbsupply.generateThumbnail(SAMPLE_VIDEO, {
                width: 100,
                height: 100,
                timestamp: '5%'
            }).then(thumbnail => fs.stat(thumbnail, done))
                .catch(done);
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
    });

});