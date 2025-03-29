<p align="center">
  <img src=".github/pinecone-router-social-card-alt-dark.png?raw=true" title="Pinecone Router logo with the text: The extendable client-side router for Alpine.js">
</p>

[![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/pinecone-router/router?color=%2337C8AB&label=version&sort=semver)](https://github.com/pinecone-router/router/tree/7.0.0)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/pinecone-router?color=37C8AB)](https://bundlephobia.com/result?p=pinecone-router@7.0.0)
[![Downloads from JSDelivr](https://data.jsdelivr.com/v1/package/npm/pinecone-router/badge?style=rounded)](https://www.jsdelivr.com/package/npm/pinecone-router)
[![npm](https://img.shields.io/npm/dm/pinecone-router?color=37C8AB&label=npm&logo=npm&logoColor=37C8AB)](https://npmjs.com/package/pinecone-router)
[![Changelog](https://img.shields.io/badge/change-log-%2337C8AB)](/CHANGELOG.md)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%99%A5-pink)](https://ko-fi.com/rehhouari)

# Pinecone Router

The feature-packed Alpine.js router.

## About

An easy to use but feature-packed router for Alpine.js.

```html
<template x-route="/" x-template>
	<h1>Welcome Home!</h1>
</template>
<template x-route="/hello/:name" x-handler="checkName" x-template>
	<h1>Hello <span x-text="$params.name"></span>!</h1>
	<button @click="$router.back()">Go Back</button>
</template>
<template x-route"notfound" x-template="/404.html"></template>
```

## Features:

- :smile: Easy and familiar syntax well integrated with Alpine.js.
- :gear: [Handler functions](#x-handler) allow you to run code before content is displayed.
- :beginner:&nbsp;&nbsp;[Inline](#inline-templates) and [external](#x-template) templates to display content.
- :sparkles: Magic **$router** & **$params** to access router data.
- &nbsp;<img src="https://skillicons.dev/icons?i=ts" width="12px" />&nbsp;&nbsp;Full Typescript support.
- :link: Automatic click handling and [loading events](#events--loading-bar).
- :hash: [Hash routing](#settings) support.

**Demo**: [Pinecone example](https://pinecone-example.vercel.app/), [(source code)](./example/).

## Installation

This projects follow the [Semantic Versioning](https://semver.org/) guidelines.

> [!IMPORTANT]
> Check the [CHANGELOG](./CHANGELOG.md) before major updates.

### CDN

Include the following `<script>` tag in the `<head>` of your document, **before Alpine.js**:

```html
<script src="https://cdn.jsdelivr.net/npm/pinecone-router@7.0.0/dist/router.min.js"></script>
```

**ES6 Module on the browser:**

```javascript
import PineconeRouter from 'https://cdn.jsdelivr.net/npm/pinecone-router@7.0.0/dist/router.esm.js'
import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/module.esm.js'
Alpine.plugin(PineconeRouter)
Alpine.start()
```

### NPM

```
npm install pinecone-router
```

```javascript
import PineconeRouter from 'pinecone-router'
import Alpine from 'alpinejs'
Alpine.plugin(PineconeRouter)
Alpine.start()
```

## Usage

### [Demo & Usage Example](https://pinecone-example.vercel.app/)

## `x-route`

Declare routes by creating a template tag with the `x-route` directive.

```html
<!-- inside an Alpine component -->
<template x-route="/hello/:name"></template>
```

> [!NOTE]
> Alternatively you can [use Javascript to add routes](#adding--removing-routes-with-javascript)

### Route matching

Uses a modified version of [my-way](https://github.com/amio/my-way).

#### Segments types

- `/literal` Literal segment
- `/:name` Named segment
- `/:name+` Rest segment
- `/:name?` Optional segment
- `/:name*` Optional rest segment
- `/:name<regex>` Named segment with regex matching
- `/:name+<regex>` Rest segment with regex matching
- `/:name?<regex>` Optional segment with regex matching
- `/:name*<regex>` Optional rest segment with regex matching

#### Accessing params

You can access the params' values with:

- `$params.paramName` from Alpine.js components.
- `context.params.paramName` from inside handlers.
- [`PineconeRouter.context.params`](#pineconerouter-object) from elsewhere in JS.

##### Regex matching

Add regex matching to params using angle brackets:

`/product/:id<\\d+>` → `/product/123` ✓ → `{ id: '123' }`  
`/product/:id<\\d+>` → `/product/abc` ✗

Works with all parameter types:

`/product/:id+<\\d+>` → `/product/123` ✗

`/api/:version<v\\d+>/:resource` → `/api/v1/users` ✓ → `{ version: 'v1', resource: 'users' }`

> [!TIP]
> URL-Encoded values are automatically decoded (`/user/john%20doe` → `{ name: 'john doe' }`)

> [!IMPORTANT]
> Trailing slashes are normalized (both `/about` and `/about/` work the same)

## `x-template`

`x-template` allows you to display content everytime the _route changes_.

### Inline templates

By adding an empty `x-template` attribute to a route template element, Pinecone Router will render its children when the route is matched.

```html
<template x-route="/" x-template>
	<div>Hello World!</div>
	<p>Works with multiple children as well</p>
</template>
```

In this example it will inserts the child elements into the document the same way `x-if` does: after the `template` tag.

#### Modifiers

- **`.target`**: Takes an ID paramater for example `.target.app` will render the inline template inside the element with the `app` ID:

```html
<template x-route="/" x-template.target.app>
	<div>Hello World!</div>
</template>
<div id="app"></div>
```

> [!TIP]
> Default Target ID can be set globally in [Settings](#settings).

### External templates

`x-template` also allows you to specify one or more external template files to be fetched from a URL.

```html
<template x-route="/" x-template="/home.html"></template>
<template
	x-route="/header"
	x-template="['/header.html', '/home.html']"
></template>
```

In this example it will fetch the html files and inserts them in the document the same way `x-if` does: after the appropriate `template` tags.

#### Modifiers

- **`.preload`**: Fetches the template on page load, without waiting for the route to be matched.
- **`.target`**: Takes an ID paramater for example `.target.app` will render the template inside the element with the `app` ID
- **`.interpolate`**: Enable named route params in template urls.

```html
<!-- you can preload templates without having to wait for the route to be matched-->
<template x-route="notfound" x-template.preload="/404.html"></template>

<!-- you can specify an element to render into -->
<template
	x-route="/profile/:id"
	x-template.target.app="/profile.html"
></template>

<!-- this will fetch templates according to the current route params -->
<!-- on /dyamic/foo it it will fetch /api/dynamic/foo.html, and so on -->
<!-- this can be helpful when using an API that generated HTML -->
<template
	x-route="/dynamic/:name"
	x-template.interpolate="/api/dynamic/:name.html"
>
</template>

<div id="app">
	<!-- profile.html content will be displayed here -->
</div>
```

> [!NOTE]
> For obvious reasons, `.preload` cannot be used with `.interpolate`.

> [!NOTE]
> Templates's content are cached by PineconeRouter in a variable when loaded, and cleared on page reload.

<br>

> [!NOTE]
> When fetching a template using a named param fails, it dispatches a [`fetch-error`](https://github.com/pinecone-router/router/#events--loading-bar) event.

> [!TIP]
> Modifiers can be used simulateneously: `x-template.preload.target.app`

> [!TIP]
> Default Target ID can be set globally in [Settings](#settings).

### Embeded Scripts

Templates can have their own script elements, which will run the template is rendered.

/template.html:

```html
<div x-data="hello" x-effect="effect">
	<h1>Homepage</h1>
	<p x-text="message"></p>
</div>
<script>
	Alpine.data('hello', () => ({
		message: 'Hello world',
		init() {
			console.log('hello from init()')
		},
		effect() {
			// this will run whenever the param `name` changes
			if (this.$params.name == 'world') {
				console.log('hello world')
			}
		},
	}))
</script>
```

> [!IMPORTANT]
> Templates does _not_ reload when the path changes on the same route.
>
> `init()` will only run when the template is rendered.

> [!TIP]
> To run a function when params change, use `x-effect` or `$watch`.

## `x-handler`

This powerful directive can be used alone or alongisde `x-template`, it allow you to excute one or more methods when a route is matched but before it is added to the [Navigation History](#navigation-history).

Handlers runs **before x-template** allowing you to redirect before showing any content.

`x-handler` takes a _function, or an array of function_, that will be called in
order.

If the handler is async, it will be awaited.

### Handler arguments

Each handler function receives two arguments:

1. `context` - The [Context object](#context-object) containing current route information.
2. `result` - A `HandlerResult` enum object with two values:
   - `result.HALT` (or `0`) - Stops execution of queued handlers handlers and
     prevents template rendering
   - `result.CONTINUE` (or `1`) - Proceeds to the next handler (this is the
     default if nothing is returned)

### Examples

### Modifiers

- **`.global`**: define global handlers that will be run for every route, it is bound to the data of the element it is defined on
  so it's best to add to the router component element (`<div x-data="router" x-handler.global="[]">`), or any element with a access
  to the handlers you're using (doesn't have to be on the same element as x-data)
  - These global handlers always run before route specific handlers.

You can also define global handlers programmatically through [Settings](#settings)

### Prevent execution of queued handlers

To prevent / stop the next handlers from executing and templates from rendering, you can:

- `return result.HALT`
- `return this.$router.navigate()` or return after, as navigation requests
  automaticalled cancel queued handlers.

## $router magic helper

`$router` is a wrapper for the [PineconeRouter object](#pineconerouter-object).

## PineconeRouter object

You can access the `PineconeRouter` object in a few ways:

- `$router` magic helper inside Alpine.js components
- `window.PineconeRouter` inside JS modules.
- `PineconeRouter` inside global JS.
- `Alpine.$router`.

Reference:

```ts
export interface PineconeRouter {
	readonly name: string
	readonly version: string

	routes: RoutesMap
	context: Context
	settings: Settings
	history: NavigationHistory

	/**
	 * Add a new route
	 *
	 * @param {string} path The path to match
	 * @param {RouteOptions} options Options for the route
	 */
	add: (path: string, options: RouteOptions) => void

	/**
	 * Remove a route
	 *
	 * @param {string} path The route to remove
	 */
	remove: (path: string) => void

	/**
	 *  Navigate to the specified path
	 *
	 * @param {string} path The path with no hash, even if using hash routing.
	 * @param {boolean} fromPopState INTERNAL Is set to true when called from
	 *                               onpopstate event
	 * @param {boolean} firstLoad INTERNAL Is set to true on browser page load.
	 * @param {number} index INTERNAL the index of the navigation history to go to
	 * @returns {Promise<void>}
	 */
	navigate: (
		path: string,
		fromPopState?: boolean,
		firstLoad?: boolean,
		index?: number
	) => Promise<void>
}
```

The routes object is a map that has a string key which is the route path, and
a value which is a Route object.

```ts
export type RoutesMap = Map<string, Route> & {
	get(key: 'notfound'): Route
}
```

See more: [Settings](#settings-object), [NavigationHistory](#navigationhistory-object), [Route](#route-object), [RouteOptions](#route-object)

## Context object

Contains information about the current route. This is available at all times:

- Using the magic helper: `$router.context` in Alpine components
- From Javascript using `window.PineconeRouter.context`
- Every [`handler`](#x-handler) method takes the `context` object as the first argument which you should use instead of the above.

Reference:

```ts
export interface Context {
	readonly path: string
	readonly route: Route
	readonly params: Record<string, string | undefined>
}
```

## Route object

```ts
export interface Route {
	/**
	 * Set to true automatically when creating a route programmatically.
	 */
	readonly programmaticTemplates: boolean
	/**
	 * The regex pattern used to match route params, if any.
	 */
	readonly pattern?: RegExp
	/**
	 * The target ID for the route templates
	 */
	readonly targetID?: string
	/**
	 * The raw route path
	 */
	readonly path: string

	handlers: Handler[]
	templates: string[]
}

export interface RouteOptions {
	targetID?: string
	handlers?: Handler[]
	templates?: string[]
	preload?: boolean
}
```

## Settings:

PineconeRouter can be configured using `PineconeRouter.settings`.

In Alpine:

```html
<div x-data="router" x-init="$router.settings({targetID: 'app'})"></div>
```

In JS:

```html
<script>
	document.addEventListener('alpine:init', () => {
		window.PineconeRouter.settings({
			hash: false,
			basePath: '/',
			targetID: undefined,
			handleClicks: true,
			alwaysLoad: false,
			globalHandlers: [],
		})
	})
</script>
```

### Settings object

```ts
interface Settings {
	/**
	 * @default false
	 * @summary enable hash routing
	 */
	hash: boolean
	/**
	 * @default `/`
	 * @summary The base path of the site, for example /blog.
	 * Note: do not use with using hash routing.
	 */
	basePath: string
	/**
	 * @default undefined
	 * @summmary Set an optional ID for where the templates will render by default.
	 * This can be overriden by the .target modifier.
	 */
	targetID?: string
	/**
	 * @default true
	 * @summary Set to false if you don't want to intercept links by default.
	 */
	handleClicks: boolean

	/**
	 * @default false
	 * @summary Set to true to always send loading events, even if the template is inline and there are no handlers.
	 */
	alwaysLoad: boolean

	/**
	 * @default []
	 * @summary handlers that will run on every route.
	 */
	globalHandlers: Handler[]
}
```

See more: [basePath](#base-path)

## Advanced

### Navigation History

Besides updating the browser history, Pinecone Router also has its own independent navigation [history object](#navigationhistory-object), keeping track of path visits, and allowing you to do `back()` and `forward()` operations without relying on the browser API.

The way it works is by recording all paths visited, excluding:

- **Duplicates**; meaning if you're on '/home' and you click a link that goes to '/home', it wont affect the history.
- **Redirects**: if you're on `/home` and you visit `/profile/old` which has a handler that redirects you to` /profile/new`, it will not add `/profile/old` to the history, only /profile/new.

If you click a link after using `back()`, meaning the `index` is not `history.entries.length-1`, it will remove all elements from `entries` starting from the `index` to the end, then appends the current path.

#### NavigationHistory object

To access the NavigationHistory object you can use

- The `$history` magic helper.
- [PineconeRouter.history](#pineconerouter-object).

```ts
export interface NavigationHistory {
	/**
	 * The current history index
	 */
	index: number

	/**
	 * The list of history entries
	 */
	entries: string[]

	/**
	 * Check if the router can navigate backward
	 * @returns {boolean} true if the router can go back
	 */
	canGoBack: () => boolean

	/**
	 * Go back to the previous route in the navigation history
	 */
	back: () => void

	/**
	 * Check if the router can navigate forward
	 *
	 * @returns {boolean} true if the router can go forward
	 */
	canGoForward: () => boolean

	/**
	 * Go to the next route in the navigation history
	 */
	forward: () => void

	/**
	 * Navigate to a specific position in the navigation history
	 *
	 * @param index The index of the navigation position to navigate to
	 * @returns void
	 */
	to: (index: number) => void
}
```

> [!TIP]
> Use [`PineconeRouter.canGoBack()`](#pineconerouter-object) or
> [`PineconeRouter.canGoForward()`](#pineconerouter-object) to check if the
> operation is possible, for example to disable the appropriate buttons.

### `notfound` route

By default when PineconeRouter initializes, a `notfound` route is created with
the handler:

```js
console.error(new ReferenceError(ROUTE_NOT_FOUND(ctx.path)))
```

You can create a new `template` element using `x-route="notfound"`
with`x-template` and or `x-handler` to add templates and replace the defaul
handler.

You can also update the `notfound` route [programmatically](#adding-a-template), using [`PineconeRouter.add`](#pineconerouter-object), to which `notfound` is the only expection that wont throw an error due to an exisitng route.

### basePath

After setting a [`Settings.basePath`](#settings), it will automatically added to
`x-route` & `x-template` paths, `PineconeRouter.add()`, and to very navigation request,
be it link clicks or `navigate()` calls.

This means if you set the `basePath` to `/parent`, you can now just write:

- `x-route="/about"` rather than `x-route="/parent/about"`.
- `x-template="/views/home.html"` rather than
  `x-template="/parent/views/home.html"`.
- `$router.navigate('/about')` rather than `$router.navigate('/parent/about')`

## Redirecting

**Redirecting from a handler**:

This will prevent any queued handlers from executing

```js
handler(context) {
	...
  this.$router.navigate(path)
  return
  // or
  return this.$router.navigate(path)
}
```

### Bypass click handling

By default Pinecone Router intercept all clicks on anchor elements with [valid attribues](./src/links.ts).

Adding a `native` / `data-native` attribute to a link will prevent Pinecone
Router from handling it:

```html
<a href="/foo" native>This will be handled by the browser</a>
```

### Disable click handling globally

You can set [`Settings.handleClicks`](#settings) to false to disable
automatically handling links by the router, unless an `x-link` attribute is
set on the anchor element.

When disabeld:

```html
<a href="/path">This will reload the page</a>
<a href="/path" x-link>This won't reload the page</a>
```

### Events / Loading bar

You can easily use [nProgress](http://ricostacruz.com/nprogress) with
`x-template`:

```js
document.addEventListener('pinecone:start', () => NProgress.start())
document.addEventListener('pinecone:end', () => NProgress.done())
document.addEventListener('pinecone:fetch-error', (err) => console.error(err))
```

| name                     | recipient | when it is dispatched                        |
| ------------------------ | --------- | -------------------------------------------- |
| **pinecone:start**       | document  | loading starts                               |
| **pinecone:end**         | document  | loading ends                                 |
| **pinecone:fetch-error** | document  | when the fetching of external templates fail |

> [!NOTE]
> By default, these events only fire when there are external templates and/or handlers.
> To make it so they are always dispatched you can use [`Settings.alwaysLoad`](#settings)

### Adding and Removing routes & templates programmatically with Javascript

you can add routes & remove them anytime programmatically using Javascript.

#### Adding a route

```js
window.PineconeRouter.add(path, options)
```

- path: string, the route's path.
- options: array of route options:

```ts
type RouteOptions = {
	targetID?: string
	handlers?: Handler[]
	templates?: string[]
	preload?: boolean
}
```

Note that by adding handlers this way you wont have access to the `this` of the alpine.js component if the handler is part of one.

#### Adding a template

You must add a local targetID in options or set a global one in [Settings](#settings):

```html
<script>
	document.addEventListener('alpine:init', () => {
		window.PineconeRouter.settings({ targetID: 'app' })
		window.PineconeRouter.add('/route', {
			templates: ['/header.html', '/body.html'],
		})
		window.PineconeRouter.add('notfound', {
			templates: ['/404.html'],
		})
	})
</script>
```

> Note: The template added through this method won't be cleared automatically until you access another route with a template, so make sure all your routes have one if you use this method.

> Note: A targetID is required, whether globally through settings or on a per rotue basis when creating a route using `add('/path', {templates: [...], targetID: 'app'})` > **Removing a route**:

#### Removing a route

[`PineconeRouter.remove(path)`](#pineconerouter-object)

**Navigating from Javascript**:

To navigate to another page from javascript you can use:

[`PineconeRouter.navigate(path)`](#pineconerouter-object)

## Compatibility

| Version | Alpine.js Version |
| ------- | ----------------- |
| ^v2.x   | v3                |
| v1.x    | v2                |

## Contributing:

Please refer to [CONTRIBUTING.md](/CONTRIBUTING.md)

## Credits

[my-way](https://github.com/amio/my-way) for new route matching logic

[@shaun/alpinejs-router](https://github.com/shaunlee/alpinejs-router) for the new x-if inspired template logic

Click handling intially method from [page.js](https://github.com/visionmedia/page.js/blob/master/index.js#L345).

## Acknowledgment

[@KevinBatdorf](https://twitter.com/KevinBatdorf) for many ideas and early feedback!

[Let’s code a client side router for your frameworkless SPA](https://medium.com/swlh/lets-code-a-client-side-router-for-your-no-framework-spa-19da93105e10) teaching client-side routing basic concepts.

[@shaun/alpinejs-router](https://github.com/shaunlee/alpinejs-router/) for being a reference of how things can be done differently.

Last but not least, everyone opening issues,discussions, and pull requests with bug reports and feature requests!

## License

Copyright (c) 2021-2025 Rafik El Hadi Houari and contributors

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/StillImage" property="dct:title" rel="dct:type">Pinecone Router <a href="https://github.com/pinecone-router/logo">Logo</a></span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://rehhouari.eu.org" property="cc:attributionName" rel="cc:attributionURL">Rafik El Hadi Houari</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

> Code from [Page.js](https://github.com/visionmedia/page.js#license) is licensed under the MIT License.
> Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>

> Code from [@shaun/alpinejs-router](https://github.com/shaunlee/alpinejs-router/) is licensed under the MIT License.
> Copyright (c) 2022 Shaun Li

> Code from [my-way](https://github.com/amio/my-way) is licensed is licensed under the MIT License.
> Copyright 2019 Amio
