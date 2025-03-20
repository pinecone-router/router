# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

#### Context object:

- Context.route is now a Route object instead of a string.
- The methods navigate|redirect|goBack|goForward etc. are no longer part of the context object
  - To call the above functions from a handler use `this.$router.navigate` if inside an Alpine component, or use `window.PineconeRouter.navigate` or `Alpine.$router.navigate` etc.

#### $router magic helper:

- Instead of providing the previous context object now it does what it says and provides `PineconeRouter` object.
- To access params you must use `$router.context.params`

#### x-route

- Removed support for + modifier as its always been the default.
- Added support for regex between parantheses as a modifier:
  - `/shop/:productId(\d+)` will only match where productId is a number

#### x-handler

- New enum HandlerResult with values HandlerResult.HALT `0` and HandlerResult.CONTINUE `1`
  - Now $router.redirect returns HandlerResult.HALT `0`
  - To halt the execution of handlers without redirecting you could import HandlerResult from 'pinecone-router' or simply return 0

## [6.2.4] - 2025-03-20

### Fixed

- Fixed interpolating templates not clearing when changing route

## [6.2.3] - 2025-03-20

### Fixed

- Changed template url interpolataion regex to `[^/.]+`

## [6.2.2] - 2025-03-20

### Fixed

- Changed template url interpolataion regex to `[^/]+` to match anything but a slash instead of `/:([a-zA-Z0-9_]+)/g`

## [6.2.1] - 2025-03-15

### Fixed

- Fixed error in `x-template.interpolate` modifier

## [6.2.0] - 2025-03-15

### Added

- Added `x-template.interpolate` modifier for fetching templates based on route params

## [6.1.0] - 2025-03-15

### Added

- Added support for `<script>` tags inside templates ([see docs](https://github.com/pinecone-router/router/blob/6.1.0/README.md#embeded-scripts)).

## [6.0.0] - 2025-02-21

### Added

- Added `PineconeRouter.settings.alwaysSendLoadingEvents` to always dispatch loading events even when no external templates or handlers are present

### Changed

- No longer passes query when navigating by default

### Removed

- Removed the option to pass search query when navigating, it served no real purpose.
  - Removed `includeQuery` parameters from all methods that had it
  - Removed `PineconeRouter.settings.includeQuery` setting

### Fixed

- Fixed loading events dispatching (Fix #54).

## [5.5.0] - 2025-02-11

### Added

- Added `x-handler.global` modifier for handlers that will be run on every route.

## [5.4.0] - 2025-02-10

### Fixed

- Fixed run order of directives, x-route > x-handler > x-template. no longer dependent on attribute order.
  - This fixes errors due to automatic attribute ordering when doing an astro build.

## [5.3.0] - 2025-02-04

### Changed

- Changed declarative templates so they replace the target's content rather than appending to it. (fix #49)

## [5.2.2] - 2025-02-03

### Added

- Added `preload` option to `PineconeRouter.add()`
  - Suggested by @boustanihani #48

## [5.2.1] - 2025-01-30

### Fixed

- Update types.

## [5.2.0] - 2025-01-30

### Added

- Added `includeQuery` option for `navigate()`, `redirect()`, `back()`, and `forward()` and the setting `PineconeRouter.settings.includeQuery` to clear search query when navigating and clicking links.
  - See [README section](/README.md#clearing-search-query-on-navigation) for documentation.
  - Thanks @yllumi #47 for the suggestion

## [5.1.0] - 2025-01-22

### Added

- Added Navigation Stack allowing for `$router.back()` method and more, see [README](/README.md#context-object--router-magic-helper) for more info. (Thanks @Blindmikey #46 for the suggestion)

## [5.0.0] - 2024-12-25

### Added

- Added support for multiple templates inside `x-template` (Thanks @RobinManoli #44 for the suggestion)

### Changed

- Breaking: Changed `Route.options.template` to `Route.options.templates`

## [4.4.1] - 2024-08-05

### Fixed

- Prevent empty string from being passed to getElementById() when the route does not have own templateId by @Aramics #40

## [4.4.0] - 2024-07-10

### Added

- Added `PineconeRouter.settins.interceptLinks` option, true by default but can be set to false to disable automatic handling of links by the router.
- Added `x-link` attribute to handle links when `interceptLinks` setting is set to false.

## [4.3.2] - 2024-04-16

### Fixed

- Fixed template rendering twice when adding routes programmatically (fix #38)

### Added

- Added `templateTargetId` option for `PineconeRouter.add()` method.

## [4.3.1] - 2024-04-03

### Added

- Update Typescript definitons. (fix #36)

### Changed

- Merged the pnpm scripts `build` & `build:types` into `build`
- Updated to latest dev dependencies

### Removed

- Removed Vite as a dev dependency

## [4.3.0] - 2024-02-21

### Added

- Add support for adding templates programmatically using `PineconeRouter.add('/route', {template: '/route.html'})`

## [4.2.0] - 2024-01-07

### Added

- Support custom target element ID for inline templates: `x-route.target.app`.
  - This means now inline templates also use [global template target id from settings](https://github.com/pinecone-router/router?tab=readme-ov-file#settings).
- Added an error when trying to use `x-template` on a template element that have a child, meaning trying to mix inline and external templates.
  - It is impossible to have both as they both put the content inside the template, x-template does after fetching it from a link. (no one tried this afaik but just in case).

### Changed

- No longer use the same variable names as `x-if` for showing and hiding inline or external templates:
  - `el._x_undoIf` -> `el._x_PineconeRouter_undoTemplate`
  - `el._x_currentIfEl` -> `el._x_PineconeRouter_CurrentTemplate`
- Now `x-route` adds an `el._x_PineconeRouter_route` with the full route as its value (including base path in settings)
  > These changes are just for internal use.

## [4.1.1] - 2024-01-06

### Fixed

- Fixed template not rendering inside the target element after revisiting the page
- Fixed loading event not being sent after preloading page finishes loading.

## [4.1.0] - 2024-01-06

### Fixed

- Fixed template not rendering when preloading another one.
- x-template.target no longer need the target to be cleared manually if the other routes do not use it.

### Changed

- Changed template rendering method, borrowed from [shaunlee/alpinejs-router](https://github.com/shaunlee/alpinejs-router).
- Changed link handling method, use preact-router's method instead of page.js
- There should be no difference for you as it's an internal change.

## [4.0.3] - 2024-01-03

### Fixed

- Fixed handlers not having access to `this` context when the handler is in an Alpine component.

## [4.0.2] - 2023-12-23

### Fixed

- Prevent reloading on double clicking links. (Fixes #24)

## [4.0.1] - 2023-12-23

### Fixed

- Fixed `fetch-error` event not triggered for 404, 500 responses (Fixes #26)

## [4.0.0] - 2023-11-27

### Added

- Added `x-template` directive replacing the views middleware.
- Added events: `pinecone-start` & `pinecone-end` that dispatch to `document` on template loading, and `fetch-error` on failure.
- Added `cleanup()` for when the route element is removed from the page, it now removes the route as well.
- Added `cleanup()` for `x-handler` and `x-template`, now the handlers and tempate are deleted when the attributes are removed.
- Added `PineconeRouter.settings.templateTargetId` when set all external templates will use render to this element

### Changed

- `PineconeRouter.currentContext` is now `PineconeRouter.context`
- Handlers are now **awaited** if they're async, so operations such as fetching will prevent rendering templates and execution of subsequent handlers until current handler is done.
- If a link is a clicked to navigate to a new page while there are handlers active, they will be automatically canceled, the current one will finish running but any ones after will not.

## [3.1.2] - 2023-11-26

### Removed

- Remove unused method from utils

## [3.1.1] - 2023-05-29

### Added

- Add "types" field to package.json

## [3.1.0] - 2023-04-26

### Fixed

- hash routing: fix automatically adding path to hash ([discussion#18](18#discussioncomment-5722802))

## [3.0.1] - 2023-04-06

### Fixed

- Removed console.log :/

## [3.0.0] - 2023-04-06

### Removed

- Removed `viewCache` property, since I removed caching functionality in Views Middleware v3.0.0

## [2.1.3] - 2022-12-04

### Fixed

- Do not call `onHandlersExecuted` middlewares if a handler redirected

## [2.1.2] - 2022-12-04

### Fixed

- routes can now be declared without handlers

## [2.0.0] - 2022-12-04

Updated to Alpine.js v3

It's mostly backward compatible but need a few tweaks:

### Removed

- no longer need `x-router` attribute in the alpine-component!

### Changed

- Changed the way you adjust [settings has changed](#settings)
- Middleware api

## [1.0.4] - 2021-06-03

### Fix

- Fix Handler type

## [1.0.3] - 2021-05-31

### Fix

- Fix Settings.middlewares type
- Change `PineconeRouter.name` from `Pinecone Router` to `pinecone-router`. (Non-breaking).

## [1.0.2] - 2021-05-31

### Fix

- Moved types back to index.ts.

## [1.0.1] - 2021-05-31

### Added

- `Middleware` type (Typescript).

## [1.0.0] - 2021-05-31

### Added

- Added type definition for the Settings object

## [0.3.1] - 2021-05-17

### Added

- Added type definition for the Context object.

### Changed

- Internal change: Switched to PNPM for package mangement.

## [0.3.0] - 2021-05-08

### Added

- Support for inline handlers!
- Ability to override settings through a parameter in router component data!

### Changed

- Switched to typescript.
- Better route matching taken from preact-router.
- Multiple handlers syntax, no longer comma separated but array instead.

### Removed

- Remove all events since loading ones cant be accurate and init one is useless until someone ask for it.
- Remove option to turn off intercepting links since it don't work. may be back with javascript config.
- Attribute settings like `x-hash`, `x-base`, `x-slash`.

## [0.1.1] - 2021-05-02

### Changed

- Internal change: use es6 rest parameter for middleware calling.
- Better link click handling taken from Page.js

## Fixed

- Fix return on notfound; you weren't able to use $router on a notfound route.
- Fix dynamically added links not handled

## Removed

- Removed onLinkIntercepted middleware function.

## [0.1.0] - 2021-05-01

### Added

- Support for multiple comma-separated handler in `x-handler`.
- Middleware support!

### Changed

- Changed the name from Alpine Router to Pinecone Router!
- Moved the repository to a new Github organization, pinecone-router.
- Moved x-render & x-views into separate middlewares.
- Renamed `context.go()` to `context.redirect()`.

### Removed

- Removed context.setHash & context.setQuery

## [0.0.9] - 2021-04-26

### Fixed

- Views were possibly rendered two times.

### Changed

- Better loadend event dispatching by waiting for views & page loads.

## [0.0.8] - 2021-04-25

### Changed

- No changes from 0.0.7, only to fix an NPM publish mistake.

## [0.0.7] - 2021-04-25

### Added

- Added `context.go(path)` for redirecting within a handler.

### Removed

- Removed magic helper module in favor of bundling with the main module

## [0.0.6] - 2021-04-24

### Added

- Added `$router` magic helper.

## [0.0.5] - 2021-04-24

### Changed

- Added NPM package.

## [0.0.4] - 2021-04-23

### Changed

- Handle routes before rendering pages or views, to allow them being used for validation etc.

## [0.0.3] - 2021-04-23

### Removed

- Let go of multi-router support for simpler codebase.

[unreleased]: https://github.com/pinecone-router/router/compare/6.2.4...HEAD
[0.0.3]: https://github.com/pinecone-router/router/compare/0.0.2...0.0.3
[0.0.4]: https://github.com/pinecone-router/router/compare/0.0.3...0.0.4
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
[1.0.3]: https://github.com/pinecone-router/router/compare/1.0.2..1.0.3
[1.0.4]: https://github.com/pinecone-router/router/compare/1.0.3..1.0.4
[2.0.0]: https://github.com/pinecone-router/router/compare/1.0.4..2.0.0
[2.1.2]: https://github.com/pinecone-router/router/compare/2.0.0..2.1.2
[2.1.3]: https://github.com/pinecone-router/router/compare/2.1.2..2.1.3
[3.0.0]: https://github.com/pinecone-router/router/compare/2.1.3..3.0.0
[3.0.1]: https://github.com/pinecone-router/router/compare/3.0.0..3.0.1
[3.1.0]: https://github.com/pinecone-router/router/compare/3.0.1..3.1.0
[3.1.1]: https://github.com/pinecone-router/router/compare/3.1.0..3.1.1
[3.1.2]: https://github.com/pinecone-router/router/compare/3.1.1..3.1.2
[4.0.0]: https://github.com/pinecone-router/router/compare/3.1.2..4.0.0
[4.0.1]: https://github.com/pinecone-router/router/compare/4.0.0..4.0.1
[4.0.2]: https://github.com/pinecone-router/router/compare/4.0.1..4.0.2
[4.0.3]: https://github.com/pinecone-router/router/compare/4.0.2..4.0.3
[4.1.0]: https://github.com/pinecone-router/router/compare/4.0.3..4.1.0
[4.1.1]: https://github.com/pinecone-router/router/compare/4.1.0..4.1.1
[4.2.0]: https://github.com/pinecone-router/router/compare/4.1.1..4.2.0
[4.3.0]: https://github.com/pinecone-router/router/compare/4.2.0..4.3.0
[4.3.1]: https://github.com/pinecone-router/router/compare/4.3.0..4.3.1
[4.3.1]: https://github.com/pinecone-router/router/compare/4.3.0..4.3.1
[4.3.2]: https://github.com/pinecone-router/router/compare/4.3.1..4.3.2
[4.4.0]: https://github.com/pinecone-router/router/compare/4.3.2..4.4.0
[4.4.1]: https://github.com/pinecone-router/router/compare/4.4.0..4.4.1
[5.0.0]: https://github.com/pinecone-router/router/compare/4.4.1..5.0.0
[5.1.0]: https://github.com/pinecone-router/router/compare/5.0.0..5.1.0
[5.2.0]: https://github.com/pinecone-router/router/compare/5.1.0..5.2.0
[5.2.1]: https://github.com/pinecone-router/router/compare/5.2.0..5.2.1
[5.2.2]: https://github.com/pinecone-router/router/compare/5.2.1..5.2.2
[5.3.0]: https://github.com/pinecone-router/router/compare/5.2.2..5.3.0
[5.4.0]: https://github.com/pinecone-router/router/compare/5.3.0..5.4.0
[5.5.0]: https://github.com/pinecone-router/router/compare/5.4.0..5.5.0
[6.0.0]: https://github.com/pinecone-router/router/compare/5.5.0..6.0.0
[6.1.0]: https://github.com/pinecone-router/router/compare/6.0.0..6.1.0
[6.2.0]: https://github.com/pinecone-router/router/compare/6.1.0..6.2.0
[6.2.1]: https://github.com/pinecone-router/router/compare/6.2.0..6.2.1
[6.2.2]: https://github.com/pinecone-router/router/compare/6.2.1..6.2.2
[6.2.3]: https://github.com/pinecone-router/router/compare/6.2.2..6.2.3
[6.2.4]: https://github.com/pinecone-router/router/compare/6.2.3..6.2.4
