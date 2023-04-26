# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0] - 2023-04-26

### Fixed

-   hash routing: fix automatically adding path to hash ([discussion#18](18#discussioncomment-5722802))

## [3.0.1] - 2023-04-06

### Fixed

-   Removed console.log :/

## [3.0.0] - 2023-04-06

### Removed

-   Removed `viewCache` property, since I removed caching functionality in Views Middleware v3.0.0

## [2.1.3] - 2022-12-04

### Fixed

-   Do not call `onHandlersExecuted` middlewares if a handler redirected

## [2.1.2] - 2022-12-04

### Fixed

-   routes can now be declared without handlers

## [2.0.0] - 2022-12-04

Updated to Alpine.js v3

It's mostly backward compatible but need a few tweaks:

### Removed

-   no longer need `x-router` attribute in the alpine-component!

### Changed

-   Changed the way you adjust [settings has changed](#settings)
-   Middleware api

## [1.0.4] - 2021-06-03

### Fix

-   Fix Handler type

## [1.0.3] - 2021-05-31

### Fix

-   Fix Settings.middlewares type
-   Change `PineconeRouter.name` from `Pinecone Router` to `pinecone-router`. (Non-breaking).

## [1.0.2] - 2021-05-31

### Fix

-   Moved types back to index.ts.

## [1.0.1] - 2021-05-31

### Added

-   `Middleware` type (Typescript).

## [1.0.0] - 2021-05-31

### Added

-   Added type definition for the Settings object

## [0.3.1] - 2021-05-17

### Added

-   Added type definition for the Context object.

### Changed

-   Internal change: Switched to PNPM for package mangement.

## [0.3.0] - 2021-05-08

### Added

-   Support for inline handlers!
-   Ability to override settings through a parameter in router component data!

### Changed

-   Switched to typescript.
-   Better route matching taken from preact-router.
-   Multiple handlers syntax, no longer comma separated but array instead.

### Removed

-   Remove all events since loading ones cant be accurate and init one is useless until someone ask for it.
-   Remove option to turn off intercepting links since it don't work. may be back with javascript config.
-   Attribute settings like `x-hash`, `x-base`, `x-slash`.

## [0.1.1] - 2021-05-02

### Changed

-   Internal change: use es6 rest parameter for middleware calling.
-   Better link click handling taken from Page.js

## Fixed

-   Fix return on notfound; you weren't able to use $router on a notfound route.
-   Fix dynamically added links not handled

## Removed

-   Removed onLinkIntercepted middleware function.

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

[unreleased]: https://github.com/pinecone-router/router/compare/3.1.0...HEAD
[0.0.4]: https://github.com/pinecone-router/router/compare/0.0.2...0.0.4
[0.0.5]: https://github.com/pinecone-router/router/compare/0.0.4...0.0.5
[0.0.6]: https://github.com/pinecone-router/router/compare/0.0.5..0.0.6
[0.0.7]: https://github.com/pinecone-router/router/compare/0.0.6..0.0.7
[0.0.8]: https://github.com/pinecone-router/router/compare/0.0.7..0.0.8
[0.0.9]: https://github.com/pinecone-router/router/compare/0.0.8..0.0.9
[0.1.0]: https://github.com/pinecone-router/router/compare/0.0.9..0.1.0
[0.1.1]: https://github.com/pinecone-router/router/compare/0.1.0..0.1.1
[0.1.2]: https://github.com/pinecone-router/router/compare/0.1.1..0.1.2
[0.3.0]: https://github.com/pinecone-router/router/compare/0.1.2..0.3.0
[0.3.1]: https://github.com/pinecone-router/router/compare/0.3.0..0.3.1
[1.0.0]: https://github.com/pinecone-router/router/compare/0.3.1..1.0.0
[1.0.1]: https://github.com/pinecone-router/router/compare/1.0.0..1.0.1
[1.0.2]: https://github.com/pinecone-router/router/compare/1.0.1..1.0.2
[1.0.3]: https://github.com/pinecone-router/router/compare/1.0.2..1.0.3
