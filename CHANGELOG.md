# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2021-05-05

### Added

-   support for inline handlers!
-   ability to override settings through a parameter in router component data!

### Changed

-	switched to typescript.
-   better route matching taken from preact-router.
-   multiple handlers syntax, no longer comma separated but array instead.

### Removed

-   remove all events since loading ones cant be accurate and init one is useless until someone ask for it.
-   remove option to turn off intercepting links since it don't work. may be back with javascript config.
-   attribute settings like `x-hash`, `x-base`, `x-slash`.

## [0.1.1] - 2021-05-02

### Changed

-   Internal change: use es6 rest parameter for middleware calling.
-   Better link click handling taken from Page.js

## Fixed

-   Fix return on notfound; you weren't able to use $router on a notfound route.
-   Fix dynamically added links not handled

## Removed

-   onLinkIntercepted middleware function.

## [0.1.0] - 2021-05-01

### Added

-   Support for multiple comma-separated handler in `x-handler`.
-   Middleware support!

### Changed

-   Changed the name from Alpine Router to Pinecone Router!
-   Moved the repository to a new Github organization, pinecone-router.
-   Moved x-render & x-views into separate middlewares.
-   Renamed `context.go()` to `context.redirect()`.

### Removed

-   Removed context.setHash & context.setQuery

## [0.0.9] - 2021-04-26

### Fixed

-   Views were possibly rendered two times.

### Changed

-   Better loadend event dispatching by waiting for views & page loads.

## [0.0.8] - 2021-04-25

### Changed

-   No changes from 0.0.7, only to fix an NPM publish mistake.

## [0.0.7] - 2021-04-25

### Added

-   Added `context.go(path)` for redirecting within a handler.

### Removed

-   Removed magic helper module in favor of bundling with the main module

## [0.0.6] - 2021-04-24

### Added

-   Added `$router` magic helper.

## [0.0.5] - 2021-04-24

### Changed

-   Added NPM package.

## [0.0.4] - 2021-04-23

### Changed

-   Handle routes before rendering pages or views, to allow them being used for validation etc.

## [0.0.3] - 2021-04-23

### Removed

-   Let go of multi-router support for simpler codebase.

[unreleased]: https://github.com/pinecone-router/router/compare/0.0.9...HEAD
[0.0.4]: https://github.com/pinecone-router/router/compare/0.0.2...0.0.4
[0.0.5]: https://github.com/pinecone-router/router/compare/0.0.4...0.0.5
[0.0.6]: https://github.com/pinecone-router/router/compare/0.0.5..0.0.6
[0.0.7]: https://github.com/pinecone-router/router/compare/0.0.6..0.0.7
[0.0.8]: https://github.com/pinecone-router/router/compare/0.0.7..0.0.8
[0.0.9]: https://github.com/pinecone-router/router/compare/0.0.8..0.0.9
[0.1.0]: https://github.com/pinecone-router/router/compare/0.0.9..0.1.0
[0.1.1]: https://github.com/pinecone-router/router/compare/0.1.0..0.1.1
[0.121]: https://github.com/pinecone-router/router/compare/0.1.1..0.1.2
