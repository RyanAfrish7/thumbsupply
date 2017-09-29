# thumbsupply
Asynchronous Node.js module to create, cache and fetch thumbnails from
videos. It uses **ffmpeg** to generate thumbnails and **ES6 Promise**.

NOT recommended for production use! The package is still in early
stage and the public API's tend to change at any time.

Any experimental usage is appreciated. Healthy criticisms, feature
requests and issues are welcome.

## Installation

```bash
npm install thumbsupply
```

## Usage

### Generating Thumbnails

The resolved promise gives filepath of the generated thumbnail. In case
of modifications to be performed on the generated thumbnail, it's
recommended to work on a copy.

Using `generateThumbnail()` method by default enables caching to speeden
up the process.

```javascript
const thumbsupply = require('thumbsupply');

thumbsupply.generateThumbnail('some-video.mp4')
    .then(thumb => {
        // serve thumbnail
    })
```

It accepts options to control timestamp and size of the thumbnail. The
`forceCreate` option can be used to generate the thumbnail every time.

```javascript
const thumbsupply = require('thumbsupply');

thumbsupply.generateThumbnail('some-video.mp4', {
    size: thumbsupply.ThumbSize.MEDIUM, // or ThumbSize.LARGE
    timestamp: "10%", // or `30` for 30 seconds
    forceCreate: true
})
```

*NOTE:* Thumbnails which are older than the video get expired
automatically.

### Clearing Cache

The method `emptyCache()` can be used to clear the cache.
