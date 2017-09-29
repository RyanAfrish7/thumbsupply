# Changelog

All notable changes to this project will be documented in this file.

This project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased] - BREAKING

### Added

+ Every application shares the common thumbnail storage.

### Changed

+ Restructured to follow a more generic structure to support different
formats like pictures, music and others in future.

### Removed

+ Per-application thumbnails are no longer valid
+ All previous methods are removed and are now available under an ES6
class. Refer docs of this version.

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