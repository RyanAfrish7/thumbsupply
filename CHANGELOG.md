# Changelog

All notable changes to this project will be documented in this file.

This project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.4.0]

### Fixed

+ Fixed non integer numbers from being passed to ffmpeg 

### Added

+ Allow configuring the cacheDir

## [0.3.1]

### Fixed

+ Handled the case where mimetype of the file is not known

### Added

+ Allow mimetype to be passed in along with the options

## [0.2.1]

### Added

+ Custom errors are thrown for expired thumbnails and unassociated
filetypes.

### Fixed

+ Fixed a RegEx bug which rejected some of the associated file types.

## [0.2.0] - BREAKING

### Added

+ Every application shares the common thumbnail storage.

### Changed

+ Restructured to follow a more generic structure to support different
formats like pictures, music and others in future.

### Removed

+ Per-application thumbnails are no longer valid
+ All previous methods are removed and are now available through an ES6
object.

### Fixed

+ Avoids redundant storage of thumbnails by each application.

## [0.1.1]

### Changed

+ Migrated from *lodash* methods to *ES6* methods.


### Fixed

+ Bug causing "wrong thumbnail location" is fixed.

## [0.1.0]

### Changed

+ Instead of hashing the entire file, this version introduces hashing of
file uri.

### Fixed

+ Reduced time to lookup for thumbnails.

## [Unreleased]

TO BE DOCUMENTED