<p align="center">
  <img src=".github/pinecone-router-social-card-alt-dark.png?raw=true" title="Pinecone Router logo with the text: The feature-packed router for
   Alpine.js">
</p>

<div align="center" style="">

[![npm](https://img.shields.io/npm/dm/pinecone-router?label=npm&logo=npm&labelColor=%23d7f4ee&color=%230b2822&style=flat&logoColor=%230b2822)](https://npmjs.com/package/pinecone-router)
![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/pinecone-router?style=flat&logo=jsdelivr&logoColor=%230b2822&label=jsdelivr&labelColor=d7f4ee&color=%230b2822)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/pinecone-router?labelColor=%23d7f4ee&style=flat&color=%230b2822&&logo=bun&logoColor=%230b2822)](https://bundlephobia.com/result?p=pinecone-router@7.0.0)
<br>
[![Changelog](https://img.shields.io/badge/changelog-0b2822?style=flat)](./CHANGELOG.md)
[![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/pinecone-router/router?labelColor=%23d7f4ee&color=%230b2822&label=version&style=flat&sort=semver&logo=semver&logoColor=%230b2822)](https://github.com/pinecone-router/router/tree/7.0.0)
[![Sponsor](https://img.shields.io/badge/sponsor-0b2822?logo=githubsponsors&style=flat)](https://ko-fi.com/rehhouari)

</div>

# Pinecone Router

A small, easy to use, and feature-packed router for Alpine.js.

```html
<div x-data="app" >
  <template x-route="/" x-template>
    <h1>Welcome!</h1>
    <p>What's your name?</p>
    <input @enter="$router.navigate('/'+$el.value)"></input>
  </template>

  <template x-route="/:name" x-handler="handle" x-template>
    <h1>Hello <span x-text="$params.name"></span>!</h1>
    <button @click="$history.back()">Go Back</button>
  </template>

  <template x-route="notfound" x-template="/404.html"></template>
</div>

<script>
  document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
      handler(context, controller) {
        if (context.params.name == 'easter') {
          this.$router.navigate('/easter-egg')
        }
      },
    }))
  })
</script>
```

## Features:

- :smile: Easy and familiar syntax well integrated with Alpine.js.
- :gear: [Handler functions](#x-handler) allow you to run functions on for each
  route.
- :beginner:&nbsp;&nbsp;[Inline](#inline-templates) and [external](#x-template) templates to display content.
- :sparkles: 3 Magic helpers to easily access
  router data.
- &nbsp;<img src="https://skillicons.dev/icons?i=ts" width="14px" />
  &nbsp;Full Typescript support.
- :link: Automatic [click handling](#bypass-click-handling) and [loading events](#events--loading).
- :hash: [Hash routing](#settings) support.

**Demo**: [Pinecone example](https://pinecone-example.vercel.app/),
[(source code)](./example/).

## Installation

This projects follow the [Semantic Versioning](https://semver.org/) guidelines.

> [!IMPORTANT]
> Check the [CHANGELOG](./CHANGELOG.md) before major updates.

> [!NOTE]
> If you're upgrading from v6, also see the more compact
> [Upgrade Guide](./upgrade_to%207.x.md).

### CDN

Include the following `<script>` tag in the `<head>` of your document, **before Alpine.js**:

```html
<script src="https://cdn.jsdelivr.net/npm/pinecone-router@7.0.0/dist/router.min.js"></script>
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

### Browser Module

```javascript
import PineconeRouter from 'https://cdn.jsdelivr.net/npm/pinecone-router@7.0.0/dist/router.esm.js'
import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/module.esm.js'
Alpine.plugin(PineconeRouter)
Alpine.start()
```

## Usage

### [Demo & Usage Example](https://pinecone-example.vercel.app/)

## `x-route`

Declare routes by creating a template tag with the `x-route` directive.

```html
<div x-data="...">
	<template x-route="/"></template>
	<template x-route="/hello/:name"></template>
	<template x-route="notfound"></template>
</div>
```

> [!NOTE]
> Alternatively you can
> [use Javascript to add routes](#adding--removing-routes-with-javascript)

> [!NOTE]
> Read more about [notfound route](#notfound-route)

### Route matching

#### Segments types

- **Literal** (`/literal`): Matches `/literal` but not `/something-else`
- **Named** (`/:name`): Matches `/john` or `/123` but not `/john/doe` or `/`
- **Optional** (`/:name?`): Matches `/profile` or `/profile/john` but
  not `/profile/john/settings`
- **Rest** (`/users/:rest+`): Matches `/users/john` or `/users/john/settings`
  but not `/users` (matches one or more)
- **Wildcard** (`/:path*`): Matches `/files`, `/files/docs`,
  `/files/docs/report.pdf` (matches zero or more)
- **Suffix** (`/movies/:title.mp4`): Matches `/movies/avatar.mp4` but not
  `/movies/avatar.mov` or `/movies/avatar`
- **Suffix Pattern** (`/movies/:title.(mp4|mov)`): Matches `/movies/avatar.mp4`
  or `/movies/avatar.mov` but not `/movies/avatar.avi` or `/movies/avatar`

> [!IMPORTANT]
> Trailing slashes are normalized (both `/about` and `/about/` work the same)
>
> Matching is case-insensitive

#### Accessing params

You can access the params' values with:

- `$params` magic helper: `$params.paramName` from Alpine.js components.
- `context.params.paramName` from inside handlers.
- [`PineconeRouter.context.params`](#pineconerouter-object) from elsewhere
  in JS.

## `x-template`

`x-template` allows you to display content everytime the _route changes_.

### Inline templates

By adding an empty `x-template` attribute to a route template element,
Pinecone Router will render its children when the route is matched.

```html
<template x-route="/" x-template>
	<div>Hello World!</div>
	<p>Works with multiple children as well</p>
</template>
```

In this example it will inserts the child elements into the document the same
way `x-if` does: _after the `template` tag_.

#### Modifiers

- **`.target`**: `.target.app` will render the inline template inside
  the element with the `app` ID:

```html
<template x-route="/" x-template.target.app>
	<div>Hello World!</div>
</template>
<div id="app"></div>
```

> [!TIP]
> Default Target ID can be set globally in [Settings](#settings).

### External templates

`x-template` also allows you to specify one or more external template files
to be fetched from a URL.

```html
<template x-route="/" x-template="/home.html"></template>
<template
	x-route="/header"
	x-template="['/header.html', '/home.html']"
></template>
```

In this example it will fetch the html files and inserts them in the document
the same way `x-if` does: after the appropriate `template` tags.

#### Modifiers

- **`.preload`**: Fetches the templates after the first page load at
  `low` priority, without waiting for the route to be matched.
- **`.target`**: Takes an ID paramater for example `.target.app` will render
  the template inside the element with the `app` ID
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
<!-- this can be helpful when using an API that generates HTML -->
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
> Templates's content are cached by PineconeRouter in a variable when loaded,
> and are automatically cleared on browser page reload.

<br>

> [!NOTE]
> When fetching a template fails, it adispatches a
> [`pinecone:fetch-error`](#events--loading) event to `document`.

> [!TIP]
> Modifiers can be used simulateneously: `x-template.preload.target.app`
> For obvious reasons, `.preload` cannot be used with `.interpolate`.

> [!TIP]
> Preload can be used globally in [Settings](#settings).

> [!TIP]
> Default Target ID can be set globally in [Settings](#settings).

### Embeded Scripts

Templates can have their own script elements, which will run when the route is
matched.

`/template.html`:

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
> Templates does _not_ re-render when the path changes on the same route.
> `init()` will run only once until the user visits another route then comes
> back.

> [!TIP]
> To run a function when params change, use `x-effect` or `$watch`:

```html
<div x-data="hello" x-effect="getData"></div>
<strong x-show="!loading" x-text="name"></strong>
<script>
	Alpine.data('name', () => ({
		loading: true,
		name: Alpine.$persist(''),
		async getData() {
			try {
				this.loading = true
				const response = await fetch(`/views/${this.$params.slug}.json`)
				const data = await response.json()
				this.name = data.name
			} catch (error) {
				console.error('Fetch error:', error)
			} finally {
				this.loading = false
			}
		},
	}))
</script>
```

## `x-handler`

This powerful directive can be used alone or alongisde `x-template`, it allow
you to excute one or more methods when a route is matched.

- `x-handler` takes a _function, or an array of functions_, that will be called
  in order.
- Handlers are awaited.
- Handlers run **before x-template** allowing you to redirect before showing
  them, or use handlers without `x-template `to display content from JS.
- Handlers run before the route is added to the
  [Navigation History](#navigation-history), so any redirection is not added to
  the history which prevents loops.

### Handler arguments

Each handler function receives two arguments:

1. `context` - The [HandlerContext object](#handler-type-reference) containing
   current route information.
2. `controller` - An
   [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
   which allows you to:

- check `controller.signal` to cancel your handler when a user navigates
  elsewhere. For example, the clicked a link while handler is `fetch`ing data.
- use `controller.abort()` to cancel subsequent handlers.

### Examples

```html
<div x-data="router()" x-handler.global="[globalHandler]">
	<!-- You can pass in a function name -->
	<template x-route="/" x-handler="home"></template>

	<!-- Or an anonymous/arrow function -->
	<template
		x-route="/home"
		x-handler="[(ctx) => ctx.redirect('/'), thisWontRun]"
	></template>

	<!-- Or even an array of multiple function names/anonymous functions! -->
	<template x-route="/hello/:name" x-handler="[checkName, hello]"></template>

	<!-- Handlers will be awaited, and their returned value is passed 
   to the next handler -->
	<template
		x-route="/home"
		x-handler="[awaitedHandler, processData]"
	></template>

	<!-- 404 handler -->
	<template x-route="notfound" x-handler="notfound"></template>
</div>

<div id="app"></div>
```

The JS:

```js
function router() {
	return {
		home(context) {
			document.querySelector('#app').innerHTML = `<h1>Home</h1>`
		},
		checkName(context) {
			if (context.params.name.toLowerCase() == 'rafik') {
				alert('we have the same name!')
			}
		},
		hello(context) {
			document.querySelector('#app').innerHTML =
				`<h1>Hello, ${context.params.name}</h1>`
		},
		notfound(context) {
			document.querySelector('#app').innerHTML = `<h1>Not Found</h1>`
		},
		thisWontRun(context) {
			// This function wont run because the previous handler redirected
			console.log('skipped!')
		},
		globalHandler(context) {
			// this will be run for every router
			console.log('global handler: ', context.route)
		},

		// async functions will be automatically awaited by Pinecone Router
		async awaitedHandler(ctx, controller) {
			try {
				// use abort signal to cancel when the user navigates away.
				const response = await fetch(
					'https://jsonplaceholder.typicode.com/posts',
					{ signal: controller.signal }
				)
				return await response.json() // pass the response to the next handler
			} catch (err) {
				// safely ignore aborts, but handle fetch errors
				if (err.name != 'AbortError') {
					console.error(`Download error: ${err.message}`)
					// abort on error for example, which wont render the route's template
					// nor run subsequent handlers
					controller.abort()
				}
			}
		},
		processData(ctx) {
			// get previous handlers returned data
			if (ctx.data) {
				console.table(ctx.data)
			}
		},
	}
}
```

### Modifiers

- **`.global`**: define global handlers that will be run for every route, it is
  bound to the data of the element it is defined on
  so it's best to add to the router component element (`<div x-data="router" x-handler.global="[]">`), or any element with a access
  to the handlers you're using (doesn't have to be on the same element as x-data)
  - These global handlers always run before route specific handlers.

> [!NOTE]
> You can also define global handlers programmatically through
> [Settings](#settings).

### Prevent execution of subsequent handlers

To prevent the next handlers from executing from inside another hanlder,
you can:

- `this.$router.navigate()` to redirect to another path, since all navigation
  requests cancel queued handlers.
- `controller.abort()` to cancel subsequent handlers without redirecting.
  - This is useful if you want to show an error from a handler without
    redirecting, ie. using JS.

### Handler Type Reference

These are the types you can import if using Alpine.js with Typescript

```ts
/**
 * Handler type takes the In and Out parameters.
 *
 * @param In  is the value of the previous handler, which will be inside
 * `HandlerContext.data`.
 * @param Out is the return value of the handler.
 */
export type Handler<In, Out> = (
	context: HandlerContext<In>,
	controller: AbortController
) => Out | Promise<Out>

/**
 * HandlerContext is the context passed to the handler.
 * It contains the current route and the data from the previous handler.
 * @param T The type of the returned data from the previous handler.
 */
export interface HandlerContext<T = unknown> extends Context {
	readonly data: T
}
```

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
	settings: (value?: Partial<Settings>) => Settings
	history: NavigationHistory

	loading: boolean

	/**
	 * Add a new route
	 *
	 * @param {string} path the path to match
	 * @param {RouteOptions} options the options for the route
	 */
	add: (path: string, options: RouteOptions) => void

	/**
	 * Remove a route
	 *
	 * @param {string} path the route to remove
	 */
	remove: (path: string) => void

	/**
	 *  Navigate to the specified path
	 *
	 * @param {string} path the path with no hash even if using hash routing
	 * @param {boolean} fromPopState INTERNAL Is set to true when called from
	 *                  onpopstate event
	 * @param {boolean} firstLoad INTERNAL Is set to true on browser page load.
	 * @param {number} index INTERNAL the index of the navigation history
	 *                  that was navigated to.
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

> [!NOTE]
> Read more: [Settings](#settings-object), [NavigationHistory](#navigationhistory-object), [Route](#route-object), [Context](#context-object),
> [RouteOptions](#route-object)

## Context object

Contains information about the current route. This is available at all times:

- Using the magic helper: `$router.context` in Alpine components
- From Javascript using `window.PineconeRouter.context`
- Every [`handler`](#x-handler) method takes the `context` object as the first argument which you should use instead of the above.

Reference:

```ts
export interface Context {
	readonly path: string
	readonly route: string
	readonly params: Record<string, string | undefined>
}
```

## Settings:

PineconeRouter can be configured using [`PineconeRouter.settings`](#pineconerouter-object).

In Alpine:

```html
<div x-data="router" x-init="$router.settings({targetID: 'app'})"></div>
```

In JS:

```html
<script>
	document.addEventListener('alpine:init', () => {
		window.PineconeRouter.settings({
			basePath: '/app',
			targetID: 'app',
		})
	})
</script>
```

`PineconeRouter.settings()` returns the current settings.

### Settings object

```ts
export interface Settings {
	/**
	 * enable hash routing
	 * @default false: boolean
	 */
	hash: boolean

	/**
	 * The base path of the site, for example /blog.
	 * No effect when using hash routing.
	 * @default `/`
	 */
	basePath: string

	/**
	 * Set an optional ID for where the templates will render by default.
	 * This can be overridden by the .target modifier.
	 * @default undefined
	 */
	targetID?: string

	/**
	 * Set to false if you don't want to intercept link clicks by default.
	 * @default true
	 */
	handleClicks: boolean

	/**
	 * Handlers that will run on every route.
	 * @default []
	 */
	globalHandlers: Handler<unknown, unknown>[]

	/**
	 * Set to true to preload all templates.
	 * @default false
	 * */
	preload: boolean
}
```

See more: [Base Path](#base-path)

## Route object

```ts
export interface Route {
	/**
	 * Set to true automatically when creating a route programmatically.
	 * @internal
	 */
	readonly programmaticTemplates: boolean

	/**
	 * Set to true when the route is added programmatically and defined as having
	 * params in the template urls
	 * @internal
	 */
	readonly interpolate: boolean
	/**
	 * The regex pattern used to match the route.
	 * @internal
	 */
	readonly pattern: RegExp
	/**
	 * The target ID for the route's templates
	 */
	readonly targetID?: string
	/**
	 * The raw route path
	 */
	readonly path: string

	match(path: string): undefined | { [key: string]: string }
	handlers: Handler<unknown, unknown>[]
	templates: string[]
}

export interface RouteOptions {
	handlers?: Route['handlers']
	interpolate?: boolean
	templates?: string[]
	targetID?: string
	preload?: boolean
}
```

## Navigation History

Besides updating the browser history, Pinecone Router also has its own
independent navigation [history object](#navigationhistory-object), keeping
track of path visits, and allowing you to do `back()` and `forward()`
operations without relying on the browser API.

The way it works is by recording all paths visited, excluding:

- **Duplicates**; meaning if you're on '/home' and you click a link that goes
  to '/home', it wont affect the history.
- **Redirects**: if you're on `/home` and you visit `/profile/old` which has a
  handler that redirects you to` /profile/new`, it will not add `/profile/old`
  to the history, only /profile/new.

If you click a link after using `back()`, meaning the `history.index` is not `history.entries.length-1`, it will remove all elements from `entries` starting
from the `history.index` to the end, then appends the current path.

### NavigationHistory object

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

## Others

### `notfound` route

By default when PineconeRouter initializes, a default `notfound` route
is created with the handler:

```js
;(ctx) => console.error(new ReferenceError(ROUTE_NOT_FOUND(ctx.path)))
```

You can create a new `template` element using `x-route="notfound"`
with`x-template` and or `x-handler` to add templates and replace the defaul
handler.

You can also update the `notfound` route [programmatically](#adding-a-template), using [`PineconeRouter.add`](#pineconerouter-object), to which `notfound` is the only expection that wont throw an error due to an exisitng route.

### Base Path

After setting a [`Settings.basePath`](#settings), it will automatically added to
`x-route` & `x-template` paths, `PineconeRouter.add()`, and to very navigation
request, be it link clicks or `navigate()` calls.

This means if you set the `basePath` to `/parent`, you can now just write:

- `x-route="/about"` rather than `x-route="/parent/about"`.
- `x-template="/views/home.html"` rather than
  `x-template="/parent/views/home.html"`.
- `$router.navigate('/about')` rather than `$router.navigate('/parent/about')`

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

### Events / Loading

| name                     | recipient | when it is dispatched               |
| ------------------------ | --------- | ----------------------------------- |
| **pinecone:start**       | document  | loading starts                      |
| **pinecone:end**         | document  | loading ends                        |
| **pinecone:fetch-error** | document  | fetching of external templates fail |

Usage from Alpine.js:

```html
<div @pinecone:start.document=""></div>
```

> [!TIP]
> You can easily use [nProgress](http://ricostacruz.com/nprogress) with
> `x-template`:

```js
document.addEventListener('pinecone:start', () => NProgress.start())
document.addEventListener('pinecone:end', () => NProgress.done())
document.addEventListener('pinecone:fetch-error', (err) => console.error(err))
```

> [!TIP]
> You can also use [$router.loading](#pineconerouter-object) to check the
> loading state reactively.

### Add & Remove Routes Programmatically

you can add routes & remove them anytime programmatically using Javascript.

#### Adding a route

```js
window.PineconeRouter.add(path, options)
```

- path: string, the route's path.
- options: array of route options:

```ts
export interface RouteOptions {
	handlers?: Route['handlers']
	interpolate?: boolean
	templates?: string[]
	targetID?: string
	preload?: boolean
}
```

Note that by adding handlers this way you wont have access to the `this` of the
alpine.js component if the handler is part of one.

#### Adding a template

You must add a local targetID in options or set a global one in
[Settings](#settings):

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

> [!IMPORTANT]
> The template added through this method won't be cleared automatically until
> you access another route with a template that has the same target, so make
> sure all your routes have the same target if you use this method.

> [!NOTE]
> A targetID is required, whether globally through settings or on a
> per rotue basis when creating a route using `add('/path', {templates: [...], targetID: 'app'})` > **Removing a route**:

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

[regexparam](https://github.com/lukeed/regexparam) for new route matching logic

[@shaun/alpinejs-router](https://github.com/shaunlee/alpinejs-router) for
the new x-if inspired [template logic](./src/templates.ts)

Click handling intially method from
[page.js](https://github.com/visionmedia/page.js/blob/master/index.js#L345).

## Acknowledgment

[@KevinBatdorf](https://twitter.com/KevinBatdorf) for many ideas and early
feedback!

[Let’s code a client side router for your frameworkless SPA](https://medium.com/swlh/lets-code-a-client-side-router-for-your-no-framework-spa-19da93105e10) teaching client-side routing basic concepts.

[@shaun/alpinejs-router](https://github.com/shaunlee/alpinejs-router/) for
being a reference of how things can be done differently.

Last but not least, everyone opening issues,discussions, and pull requests
with bug reports and feature requests!

## License

Copyright (c) 2021-2025 Rafik El Hadi Houari and contributors

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/StillImage" property="dct:title" rel="dct:type">Pinecone Router <a href="https://github.com/pinecone-router/logo">Logo</a></span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://rehhouari.eu.org" property="cc:attributionName" rel="cc:attributionURL">Rafik El Hadi Houari</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

> Code from [Page.js](https://github.com/visionmedia/page.js#license) is licensed under the MIT License.
> Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>

> Code from [@shaun/alpinejs-router](https://github.com/shaunlee/alpinejs-router/) is licensed under the MIT License.
> Copyright (c) 2022 Shaun Li

> Code from [regexparam](https://github.com/lukeed/regexparam) is licensed is licensed under the MIT License.
> Copyright (c) Luke Edwards
