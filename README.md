<p align="center">
  <img src="https://github.com/pinecone-router/router/blob/main/.github/pinecone-router-social-card-alt-big.png?raw=true" title="Pinecone Router logo with the text: The extendable client-side router for Alpine.js">
</p>

[![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/pinecone-router/router?color=%2337C8AB&label=version&sort=semver)](https://github.com/pinecone-router/router/tree/0.3.0)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/pinecone-router?color=37C8AB)](https://bundlephobia.com/result?p=pinecone-router@0.3.0)
[![Downloads from Jsdelivr NPM](https://img.shields.io/jsdelivr/npm/hm/pinecone-router?color=%2337C8AB&&logo=npm)](https://www.jsdelivr.com/package/npm/pinecone-router)
[![npm](https://img.shields.io/npm/dm/pinecone-router?color=37C8AB&label=npm&logo=npm&logoColor=37C8AB)](https://npmjs.com/package/pinecone-router)
![David](https://img.shields.io/david/pinecone-router/router?color=37C8AB)
[![Changelog](https://img.shields.io/badge/change-log-%2337C8AB)](/CHANGELOG.md)

# Pinecone Router

The extendable client-side router for Alpine.js.

## About

An easy to use but feature-packed client-side router for use with Alpine.js.

It can be used to:

-   Handle routes & process route variables.
-   Use magic helper `$router` helper to display elements dynamically etc. inside all Alpine.js Components.
-   Many more using [middlewares](#middlewares)!.

## Features:

-   :smile: Easy and familiar syntax well integrated with Alpine.js.
-   -   The router is an Alpine component, handlers and settings are set in its data.
-   :link: Automatically handle relative links and handle them.
-   :hash: [Hash routing](#settings).
-   :heavy_plus_sign: Extendable using tiny [Middlewares! 🪜](#middlewares).
-   :sparkles: [Magic **$router** helper](#magic-helper) to access current route, params, redirect, ect. from _all_ alpine components!
-   :gear: Easily configurable through [settings](#settings)!

**Demo**: [Pinecone example](https://pinecone-example.vercel.app/), [(source code)](https://github.com/rehhouari/pinecone-example).

Better examples coming soon!

## Installation

Not ready for production yet, stable version coming soon! **[help welcome!](/CONTRIBUTING.md)**

> **Watch releases for version 1.0!**

### CDN

Include the following `<script>` tag in the `<head>` of your document, before Alpine.js:

```html
<script src="https://cdn.jsdelivr.net/npm/pinecone-router@0.3.0/dist/index.umd.js"></script>
```

**ES6 Module:**

```javascript
import 'https://cdn.jsdelivr.net/npm/pinecone-router@0.3.0/dist/index.umd.js';
```

### NPM

```
npm install pinecone-router
```

```javascript
// load pinecone router
import 'pinecone-router';
// then load alpine.js
import 'alpinejs';
```

> **Important**: This must be added **before** loading Alpine.js.

## Usage

### [Demo & Usage Example](https://pinecone-router-example.vercel.app)

### Handle routes

1.  Create an Alpine.js component with an empty `x-router` attribute.
2.  Declare routes by creating a template tag with `x-route` and `x-handler` attributes.

```html
<div x-data="router()" x-router>
	<!-- You can pass in a function name -->
	<template x-route="/" x-handler="home"></template>
	<!-- Or an anonymous/arrow function -->
	<template x-route="/home" x-handler="(ctx) => ctx.redirect('/')"></template>
	<!-- Or even an array of multiple function names/anonymous functions! -->
	<template x-route="/hello/:name" x-handler="[checkName, hello]"></template>
	<!-- 404 handler -->
	<template x-route="notfound" x-handler="notfound"></template>
</div>

<div id="app"></div>
```

> **Important**: There can only be one router in the page!

The javascript:

> can also be embedded inside `x-data`.

```js
function router() {
	return {
		main(context) {
			document.querySelector('#app').innerHTML = `<h1>Home</h1>`;
		},
		checkName(context) {
			// if the name is "home" go to the home page.
			if (context.params.name.toLowerCase() == 'home') {
				// redirecting is done by returning the context.redirect method.
				return context.redirect('/');
			}
		},
		hello(context) {
			document.querySelector(
				'#app'
			).innerHTML = `<h1>Hello, ${context.params.name}</h1>`;
		},
		notfound(context) {
			document.querySelector('#app').innerHTML = `<h1>Not Found</h1>`;
		},
	};
}
```

> > **Note**: we use [path-to-regexp](https://github.com/pillarjs/path-to-regexp) for matching route paths.

#### Context Object

The handler takes a `context` argument which consists of:

-   **context.route** _(/path/:var)_ The route set with `x-route`.
-   **context.path** _(/path/something)_ The path visited by the client.
-   **context.params** _({var: something})_ Object that contains route parameters if any.
-   **context.hash** hash fragment without the #
-   **context.query** search query without the ?
-   **context.redirect(path: string)** function that allow you to redirect to another page.
-   -   **Important**: usage within x-handler: `return context.redirect('/path');`

### Route matching

Parameters can be made optional by adding a ?, or turned into a wildcard match by adding \* (zero or more characters) or + (one or more characters):

```html
<template x-route="/b/:id" x-handler="..."></template>
<template x-route="/c/:remaining_path*" x-handler="..."></template>
<template x-route="/d/:remaining_path+" x-handler="..."></template>
```

> Borrowed from [Preact Router](https://github.com/preactjs/preact-router)

### Redirecting

It can be done many ways! here's how:

**From an Alpine component**:

-   use [`$router` magic helper](#magic-helper): `$router.redirect(path)`.
-   -   example: `@click="$router.redirect(path)"`

**Redirecting from the handler**:

To redirect from inside a handler function return the context's `redirect` method:

```js
handler(context) {
	...
	return context.redirect(path)
}
```

> **Important**: inside the handler you _must_ return the `context.redirect()` function.

### Middlewares

Pinecone Router is extendable through middlewares!

#### Official Middlewares

-   [Render views](https://github.com/pinecone-router/middleware-views): manually set the view for each route and have it rendered!

-   [Display server rendered pages](https://github.com/pinecone-router/middleware-render): automatically load server-rendered pages with preloading (like Turbolinks)

Create your own middlewares [using this template](https://github.com/pinecone-router/middleware-template)!

### Settings:

To override settings simply add a `settings` parameter to your router component's data.

**Note**: you _don't_ have to specify all, just the ones you want to override.

```js
function router() {
	return {
		// configuration
		settings: {
			/**
			 * @type {boolean}
			 * @summary enable hash routing
			 */
			hash: false,
			/**
			 * @type {string}
			 * @summary The base path of the site, for example /blog
			 * Note: do not use with using hash routing!
			 */
			basePath: '/',
		}
		// handlers
		...
	};
}

```

#### Bypass link handling

Adding a `native` attribute to a link will prevent Pinecone Router from handling it:

```html
<a href="/foo" native>Foo</a>
```

### Global Context

You can access current path's [context](#context-object) from alpine components use [$router magic helper](#magic-helper) or from anywhere in your javascript by accessing `window.PineconeRouter.currentContext`.

### Magic Helper

To make it easier to access the [current context](#context-object) from anywhere, you can use the `$router` magic helper:

**Usage**:
Refer to [global context](#global-context).
`$router.params.name`, `$router.redirect(path)`, `$router.hash`, [etc](#context-object).

### Loading bar

You can easily use [nProgress](http://ricostacruz.com/nprogress).

**Tip:** if you're going to `fetch` views, you can use [this middleware](https://github.com/pinecone-router/middleware-views) which provide [loading events](https://github.com/pinecone-router/middleware-views/#events)

[**Demo**](https://pinecone-example-views.vercel.app/)

### Advanced

<details>
	<summary>
		<strong>Show</strong>
	</summary>

#### Adding & Removing routes with Javascript

you can add routes & remove them anytime using Javascript.

**Adding a route**:

```js
window.PineconeRouter.add(path, handlers);
```

-   path: string, the route's path.
-   handlers: array of functions, the handlers of the route.

**Removing a route**:

```js
window.PineconeRouter.remove(path);
```

-   path: string, the path of the route you want to remove.

**Navigating from Javascript**:

To navigate to another page from javascript you can:

```js
window.PineconeRouter.navigate(path);
```

</details>

### Browser Support

Supports same versions supported by Alpine.js by default, including IE11.

> `dist/index.modern` is provided if you want to only support modern browsers with es6+ support.

<details>
<summary>full list</summary>
and_chr 89, and_ff 86, and_qq 10.4, and_uc 12.12, android 89, baidu 7.12, chrome 90, chrome 89, chrome 88, chrome 87, edge 90, edge 89, edge 88, firefox 87, firefox 86, firefox 78, ie 11, ios_saf 14.0-14.5, ios_saf 13.4-13.7, kaios 2.5, op_mini all, op_mob 62, opera 73, opera 72, safari 14, safari 13.1, samsung 13.0, samsung 12.0
</details>

## Contributing:

Please refer to [CONTRIBUTING.md](/CONTRIBUTING.md)

## Credits

This library uses modified chunks of code from [this tutorial](https://medium.com/swlh/lets-code-a-client-side-router-for-your-no-framework-spa-19da93105e10) & from [page.js](https://github.com/visionmedia/page.js). The parts used are specified in [source comments](src/).

## Acknowledgment

[@KevinBatdorf](https://twitter.com/KevinBatdorf) for many ideas and early feedback!

> **Disclaimer**: Not affiliated with the Alpine.js team, developed independently.

## Versioning

This projects follow the [Semantic Versioning](https://semver.org/) guidelines.

## License

Copyright (c) 2021 Rafik El Hadi Houari and contributors

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/StillImage" property="dct:title" rel="dct:type">Pinecone Router <a href="https://github.com/pinecone-router/logo">Logo</a></span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://rehhouari.eu.org" property="cc:attributionName" rel="cc:attributionURL">Rafik El Hadi Houari</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

> Code from [Page.js](https://github.com/visionmedia/page.js#license) is licensed under the MIT License.
> Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>

> Code from [Simple-javascript-router tutorial](https://github.com/vijitail/simple-javascript-router/) is licensed under the MIT License.
> Copyright (c) 2021 Vijit Ail (https://github.com/vijitail).

> Route matching function from [Preact Router](https://github.com/preactjs/preact-router) is licensed under the MIT License.
> Copyright (c) 2015 Jason Miller
