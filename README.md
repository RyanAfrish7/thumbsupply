# thumbsupply
Asynchronous Node.js module to create, cache and fetch thumbnails from
videos. It uses **ffmpeg** to generate thumbnails and **ES6 Promise**.

NOT recommended for production use! The package is still in early
stage and the public API's tend to change at any time.

Any experimental usage is appreciated. Healthy criticisms, feature
requests and issues are welcome.

*NOTE*: Since v0.2, the module no longer maintains thumbnails separately
for each application. This behavior is intended to improve the performance
and utilize caching as far as possible.

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
`forceCreate` option can be used to generate the thumbnail every 
time. Mimetype of the file can be specified using `mimetype` 
option. It overrides mimetype derived from the file extension and 
can be used for cases where such derivation is not possible.

```javascript
const thumbsupply = require('thumbsupply');

thumbsupply.generateThumbnail('some-video.mp4', {
    size: thumbsupply.ThumbSize.MEDIUM, // or ThumbSize.LARGE
    timestamp: "10%", // or `30` for 30 seconds
    forceCreate: true,
    mimetype: "video/mp4"
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
```

## Features on the way

_thumbsupply_ will soon be supporting music, pictures and so on. The
architecture required is already shipped.

Developers can experiment with some of the non public API's to create
thumbnail suppliers supporting new formats. Documentation on how to do
that will be released with the production version.

## External bugs

+ _ffmpeg_ is producing screenshots which mismatch the resolution
specified by 1 unit.