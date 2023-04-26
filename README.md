<p align="center">
  <img src="https://github.com/pinecone-router/router/blob/main/.github/pinecone-router-social-card-alt-big.png?raw=true" title="Pinecone Router logo with the text: The extendable client-side router for Alpine.js">
</p>

[![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/pinecone-router/router?color=%2337C8AB&label=version&sort=semver)](https://github.com/pinecone-router/router/tree/3.1.0)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/pinecone-router?color=37C8AB)](https://bundlephobia.com/result?p=pinecone-router@3.1.0)
[![Downloads from JSDelivr](https://data.jsdelivr.com/v1/package/npm/pinecone-router/badge?style=rounded)](https://www.jsdelivr.com/package/npm/pinecone-router)
[![npm](https://img.shields.io/npm/dm/pinecone-router?color=37C8AB&label=npm&logo=npm&logoColor=37C8AB)](https://npmjs.com/package/pinecone-router)
[![Changelog](https://img.shields.io/badge/change-log-%2337C8AB)](/CHANGELOG.md)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%99%A5-pink)](https://ko-fi.com/rehhouari)

# Pinecone Router

The extendable client-side router for Alpine.js v3.

## About

An easy to use but feature-packed client-side router for use with Alpine.js.

It can be used to:

-   Register routes & process route variables.
-   Use magic helper `$router` helper to display elements dynamically etc. inside all Alpine.js Components.
-   Many more using [middlewares](#middlewares)!.

## Features:

-   :smile: Easy and familiar syntax well integrated with Alpine.js.
-   :link: Automatically dispatch relative links and handle them.
-   :sparkles: [Magic **$router** helper](#context-object) to access current route, params, redirect, ect. from _all_ alpine components!
-   :hash: [Hash routing](#settings).
-   :heavy_plus_sign: Extendable using tiny [Middlewares!](#middlewares).

**Demo**: [Pinecone example](https://pinecone-example.vercel.app/), [(source code)](https://github.com/rehhouari/pinecone-example).

## Installation

> Check the [CHANGELOG](./CHANGELOG.md) before updates.

### CDN

Include the following `<script>` tag in the `<head>` of your document, **before Alpine.js**:

```html
<script src="https://cdn.jsdelivr.net/npm/pinecone-router@3.x.x/dist/router.min.js"></script>
```

**ES6 Module on the browser:**

```javascript
import PineconeRouter from 'https://cdn.jsdelivr.net/npm/pinecone-router@3.x.x/dist/router.esm.js'
import Alpine from 'https://esm.sh/alpinejs'
Alpine.plugin(PineconeRouter)
Alpine.start()
```

### NPM

```
npm install pinecone-router
```

```javascript
// load pinecone router
import PineconeRouter from 'pinecone-router'
// then load alpine.js
import Alpine from 'alpinejs'
// add the router as a plugin
Alpine.plugin(PineconeRouter)
// start alpine
Alpine.start()
```

## Usage

### [Demo & Usage Example](https://pinecone-example.vercel.app/)

## Declare routes

Declare routes by creating a template tag with `x-route` and **optionally** an `x-handler` attribute.

> Note: alternatively you can [use Javascript to add routes](#advanced)

### Without `x-handler`

```html
<!-- register the route, no need for a handler-->
<template x-route="/profile/:id"></template>

<!-- now you can use the route in anyway you'd like! -->
<template x-if="$router.route == '/profile/:id'">
	<div>profile <span x-text="$router.params.id"></span></div>
</template>
```

[More about $router helper](#context-object)

### With `x-handler`

```html
<div x-data="router()">
	<!-- You can pass in a function name -->
	<template x-route="/" x-handler="home"></template>
	<!-- Or an anonymous/arrow function -->
	<template x-route="/home" x-handler="(ctx) => ctx.redirect('/')"></template>
	<!-- Or even an array of multiple function names/anonymous functions! -->
	<!-- To prevent the next handlers from executing return 'stop' from the previous handler` or redirect -->
	<template x-route="/hello/:name" x-handler="[checkName, hello]"></template>
	<!-- 404 handler -->
	<template x-route="notfound" x-handler="notfound"></template>
</div>

<div id="app"></div>
```

The javascript:

> can also be embedded inside `x-data`.

```js
function router() {
	return {
		home(context) {
			document.querySelector('#app').innerHTML = `<h1>Home</h1>`
		},
		checkName(context) {
			if (context.params.name.toLowerCase() == 'rafik') {
				console.log('we have the same name!')
			}
		},
		hello(context) {
			document.querySelector(
				'#app'
			).innerHTML = `<h1>Hello, ${context.params.name}</h1>`
		},
		notfound(context) {
			document.querySelector('#app').innerHTML = `<h1>Not Found</h1>`
		},
	}
}
```

#### Multiple Handlers for a single route

To prevent / stop the next handlers from executing `return 'stop'` from the previous handler or `return $router.redirect('/some/path')`

### Context Object

Contains information about the current route. This available at all times:

Using the `$router` magic helper in Alpine components

From Javascript using `window.PineconeRouter.currentContext`

Every `handler` method takes the context object as the only argument

-   _context_.**route** _(/path/:var)_ The route set with `x-route`.
-   _context_.**path** _(/path/something)_ The path visited by the client.
-   _context_.**params** _({var: something})_ Object that contains route parameters if any.
-   _context_.**hash** hash fragment without the #
-   _context_.**query** search query without the ?
-   _context_.**redirect(path: string)** function that allow you to redirect to another page.
-   -   **Note**: usage within x-handler: `return context.redirect('/path');`
-   _context_.**navigate(path: string)** same as clicking a link

**Using magic helper:** `$router.params.id`, `$router.route`, etc

### Route matching

Parameters can be made optional by adding a ?, or turned into a wildcard match by adding \* (zero or more characters) or + (one or more characters):

```html
<template x-route="/b/:id" x-handler="..."></template>
<template x-route="/a/:optional?/:params?" x-handler="..."></template>
<template x-route="/c/:remaining_path*" x-handler="..."></template>
<template x-route="/d/:remaining_path+" x-handler="..."></template>
```

> Borrowed from [Preact Router](https://github.com/preactjs/preact-router)

## Redirecting

**From an Alpine component**:

-   use [`$router` magic helper](#magic-helper): `$router.navigate(path)`.

**Redirecting from the handler**:

To redirect from inside a handler function return the context's `redirect` method:

This will stop any other handlers from executing

```js
handler(context) {
	...
	return context.redirect(path)
}
```

> **Important**: inside the handler you _must_ return the `context.redirect()` function.

> `return context.redirect(path)` will prevent execution of any other handelers that are after this one

> if you wish to prevent execution of other handlers without redirecting use `return 'stop'`

## Middlewares

Pinecone Router is extendable through middlewares!

### [Views (x-view="/file.html")](https://github.com/pinecone-router/middleware-views)

Allows you to set the path for an HTML file and it'll be fetched and displayed in the specified element (`#app` by default).

Create your own middlewares [using this template](https://github.com/pinecone-router/middleware-template)!

## Settings:

```html
<script>
	document.addEventListener('alpine:initialized', () => {
		window.PineconeRouter.settings.hash = false // use hash routing
		window.PineconeRouter.settings.basePath = '/' // set the base for the URL, doesn't work with hash routing
	})
</script>
```

## Bypass link handling

Adding a `native` attribute to a link will prevent Pinecone Router from handling it:

```html
<a href="/foo" native>Foo</a>
```

## Loading bar

You can easily use [nProgress](http://ricostacruz.com/nprogress).

if you're going to `fetch` pages, you can use [views middleware](https://github.com/pinecone-router/middleware-views) which provide [loading events](https://github.com/pinecone-router/middleware-views/#events)

[**Demo**](https://pinecone-example-views.vercel.app/)
[**Source**](https://github.com/rehhouari/pinecone-example-views)

## Advanced

#### Adding & Removing routes with Javascript

you can add routes & remove them anytime using Javascript.

**Adding a route**:

```js
window.PineconeRouter.add(path, options)
```

-   path: string, the route's path.
-   options: array of options that can be anything for example: `{handlers: [], view: '/home.html'}`

**Removing a route**:

```js
window.PineconeRouter.remove(path)
```

-   path: string, the path of the route you want to remove.

**Navigating from Javascript**:

To navigate to another page from javascript you can use:

```js
window.PineconeRouter.currentContext.navigate(path)
```

## Compatibility

| Version | Alpine.js Version |
| ------- | ----------------- |
| ^v2.x   | v3                |
| v1.x    | v2                |

## Contributing:

Please refer to [CONTRIBUTING.md](/CONTRIBUTING.md)

## Credits

This library uses modified chunks of code from [this tutorial](https://medium.com/swlh/lets-code-a-client-side-router-for-your-no-framework-spa-19da93105e10) & from [page.js](https://github.com/visionmedia/page.js).

## Acknowledgment

[@KevinBatdorf](https://twitter.com/KevinBatdorf) for many ideas and early feedback!

> **Disclaimer**: Not affiliated with the Alpine.js team, developed independently.

## Versioning

This projects follow the [Semantic Versioning](https://semver.org/) guidelines.

## License

Copyright (c) 2023 Rafik El Hadi Houari and contributors

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/StillImage" property="dct:title" rel="dct:type">Pinecone Router <a href="https://github.com/pinecone-router/logo">Logo</a></span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://rehhouari.eu.org" property="cc:attributionName" rel="cc:attributionURL">Rafik El Hadi Houari</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

> Code from [Page.js](https://github.com/visionmedia/page.js#license) is licensed under the MIT License.
> Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>

> Code from [Simple-javascript-router tutorial](https://github.com/vijitail/simple-javascript-router/) is licensed under the MIT License.
> Copyright (c) 2021 Vijit Ail (https://github.com/vijitail).

> Route matching function from [Preact Router](https://github.com/preactjs/preact-router) is licensed under the MIT License.
> Copyright (c) 2015 Jason Miller
