# thumbsupply
Asynchronous Node.js module to create, cache and fetch thumbnails from
videos. It uses **ffmpeg** to generate thumbnails and **ES6 Promise**.

## Usage

### Generating Thumbnails

The resolved promise gives filepath of the generated thumbnail. In case
of modifications to be performed on the generated thumbnail, it's
recommended to work on a copy.

Using `generateThumbnail()` method by default enables caching to speeden
up the process.

```
const thumbsupply = require('thumbsupply')("your.application.id");

thumbsupply.generateThumbnail('some-video.mp4')
    .then(thumb => {
        // serve thumbnail
    })
```

It accepts options to control timestamp and size of the thumbnail. The
`forceCreate` option can be used to generate the thumbnail every time.

```
thumbsupply.generateThumbnail('some-video.mp4', {
    width: 720,
    height: 405,
    timestamp: "10%", // or `30` for 30 seconds
    forceCreate: true
})
```

*NOTE:* Thumbnails which are older than the video get expired
automatically.

### Clearing Cache

The method `emptyCache()` can be used to clear the cache.