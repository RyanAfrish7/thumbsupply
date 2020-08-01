# thumbsupply
A node.js module to create, cache and fetch thumbnails from
videos. It relies on **ffmpeg** to generate thumbnails.

The API is more reliable now and is unlikely to have major changes before stable release.

Healthy criticisms, feature requests and issues are welcome.

## Prerequisites

Install `ffmpeg` in your system.

```bash
sudo apt install ffmpeg
```

## Installation

```bash
npm install thumbsupply
```

## Usage

### Generating Thumbnails

The resolved promise gives **filepath** of the generated thumbnail. In case
of modifications to be performed on the generated thumbnail, it's
recommended to work on a copy.

Using `generateThumbnail()` method by default enables caching to speeden
up the process.

```javascript
import thumbsupply from "thumbsupply";

thumbsupply.generateThumbnail('some-video.mp4')
    .then(thumb => {
        // serve thumbnail
    })
```

It accepts options to control timestamp and size of the thumbnail. The
`forceCreate` option can be used to generate the thumbnail every 
time. Mimetype of the file can be specified using `mimeType` 
option. It overrides mimetype derived from the file extension and 
can be used for cases where such derivation is not possible. `cacheDir` 
allows configuring the directory to store the thumbnail cache. Unless 
there is an explicit need, it is good to use shared cache.

```javascript
import thumbsupply from 'thumbsupply';

thumbsupply.generateThumbnail('some-video.mp4', {
    size: thumbsupply.ThumbSize.MEDIUM, // or ThumbSize.LARGE
    forceCreate: true,
    cacheDir: "~/myapp/cache",
    mimeType: "video/mp4"
})
```

*NOTE:* Thumbnails which are older than the video get expired
automatically.

### Look up Thumbnails

Instead of creating a thumbnail, sometimes you may need to get the
thumbnail if it exists.

```javascript
const thumbsupply = require('thumbsupply');

thumbsupply.lookupThumbnail('some-video.mp4')
    .then(thumb => {
        // serve thumbnail
    })
    .catch(err => {
        // thumbnail doesn't exist
    });
``
## Limitations

+ Thumbnail sizes may get rounded off to next even number. Find more information [here](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/910)
