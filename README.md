<p align="center">
  <img src="https://github.com/pinecone-router/router/blob/main/.github/pinecone-router-social-card-alt-big.png?raw=true" title="Pinecone Router logo with the text: The extendable client-side router for Alpine.js">
</p>

[![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/pinecone-router/router?color=%2337C8AB&label=version&sort=semver)](https://github.com/pinecone-router/router/tree/4.4.)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/pinecone-router?color=37C8AB)](https://bundlephobia.com/result?p=pinecone-router@4.4.1)
[![Downloads from JSDelivr](https://data.jsdelivr.com/v1/package/npm/pinecone-router/badge?style=rounded)](https://www.jsdelivr.com/package/npm/pinecone-router)
[![npm](https://img.shields.io/npm/dm/pinecone-router?color=37C8AB&label=npm&logo=npm&logoColor=37C8AB)](https://npmjs.com/package/pinecone-router)
[![Changelog](https://img.shields.io/badge/change-log-%2337C8AB)](/CHANGELOG.md)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%99%A5-pink)](https://ko-fi.com/rehhouari)

# Pinecone Router

The extendable client-side router for Alpine.js v3.

> #### v4 update brings new features with minor breaking changes, see [ChangeLog](/CHANGELOG.md#400---2023-11-26) for what to update!

## About

An easy to use but feature-packed client-side router for use with Alpine.js.

## Features:

-   :smile: Easy and familiar syntax well integrated with Alpine.js.
-   :gear: [Handler functions](#x-handler) allow you to run code before content is displayed
-   :sparkles: [Magic **$router** helper](#context-object--router-magic-helper) to access current route, params, redirect, ect. from _all_ alpine components!
-   :beginner: [Inline](#inline-templates) and [external](#x-template) templates.
-   :link: Automatically dispatch relative links and handle them.
-   :hash:  [Hash routing](#settings).
-   :heavy_plus_sign: Extendable using tiny [Middlewares!](#middlewares).

**Demo**: [Pinecone example](https://pinecone-example.vercel.app/), [(source code)](https://github.com/pinecone-router/pinecone-example).

## Installation

> Check the [CHANGELOG](./CHANGELOG.md) before updates.

### CDN

Include the following `<script>` tag in the `<head>` of your document, **before Alpine.js**:

```html
<script src="https://cdn.jsdelivr.net/npm/pinecone-router@4.x.x/dist/router.min.js"></script>
```

**ES6 Module on the browser:**

```javascript
import PineconeRouter from 'https://cdn.jsdelivr.net/npm/pinecone-router@4.x.x/dist/router.esm.js'
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

## `x-route`

Declare routes by creating a template tag with the `x-route` directive.

```html
<!-- inside an Alpine component -->
<template x-route="/hello/:name">
	<div>
		Hello <span x-text="$router.params.name"></span>
	</div>
</template>

```

> [See more about the $router magic helper](#context-object--router-magic-helper)

### Route matching

Parameters can be made optional by adding a ?, or turned into a wildcard match by adding \* (zero or more characters) or + (one or more characters):

```html
<template x-route="/a/:id"></template>
<template x-route="/b/:optional?/:params?"></template>
<template x-route="/c/:remaining_path*"></template>
<template x-route="/d/:remaining_path+"></template>
<template x-route="notfound"></template>
```

Then you access paramaters with `$router.params.X`.

> Borrowed from [Preact Router](https://github.com/preactjs/preact-router)

> Note: alternatively you can [use Javascript to add routes](#adding--removing-routes-with-javascript)

### Inline templates

If you add a child to the `<template>` element, Pinecone Router will render it when the route is matched. It works similair to `x-if` therefore they cannot be used together, use [`x-handler`](#x-handler) instead for conditionally showing a template.

```html
<template x-route="/">
	<div>Hello World!</div>
</template>
```

In this example it will add the `div` with "Hello World" to the document the same way `x-if` does: after the `template` tag.


### Modifiers

- **`.target`**: Takes an ID paramater for example `.target.app` will render the inline template inside the element with the `app` ID:


```html
<template x-route.target.app="/">
	<div>Hello World!</div>
</template>
<div id="app"></div>
```
> Default Target ID can be set globally in [settings](#settings)


## `x-template`

This directive allows you to specify an external template file fetched from a URL

```html
<!-- when the route is matched, this will fetch the content of home.html -->
<!-- then inserts it into the page after this template element-->
<template x-route="/" x-template="/home.html"></template>
```

### Modifiers

- **`.preload`**: Fetches the template on page load, without waiting for the route to be matched.
- **`.target`**: Takes an ID paramater for example `.target.app` will render the template inside the element with the `app` ID

> Can be used simulateneously: `x-template.preload.target.app`

> Default Target ID can be set globally in [settings](#settings)


```html
<!-- you can preload templates without having to wait for the route to be matched-->
<template x-route="notfound" x-template.preload="/404.html"></template>

<!-- you can specify an element to display the content of the template inside -->
<template x-route="/profile/:id" x-template.target.app="/profile.html"></template>

<div id="app">
	<!-- profile.html content will be displayed here -->
</div>
```


## `x-handler`

This powerful directive can be used alone or alongisde `x-template`, it allow you to excute one or more methods when a route is matched.
This runs **before inline templates and `x-template`** allowing you to redirect before showing any content, detect implement authentication / authorization, or fetch any data you need.

```html
<div x-data="router()">
	<!-- You can pass in a function name -->
	<template x-route="/" x-handler="home"></template>

	<!-- Or an anonymous/arrow function -->
	<template x-route="/home" x-handler="[(ctx) => ctx.redirect('/'), thisWontRun]"></template>

	<!-- Or even an array of multiple function names/anonymous functions! -->
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
		// async functions will be automatically awaited by Pinecone Router
		async checkName(context) {
			await new Promise(resolve => setTimeout(resolve, 1000))
			if (context.params.name.toLowerCase() == 'rafik') {
				alert('we have the same name!')
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
		thisWontRun() {
			// This function wont run because the previous function returned ctx.redirect()
			console.log("skipped!")
		}
	}
}
```

See [Redirecting](#redirecting)

### Multiple Handlers for a single route

To prevent / stop the next handlers from executing and templates from rendering, `return 'stop'` from the current handler or `return ctx.redirect('/some/path')`.


## Context object / $router magic helper

Contains information about the current route. This is available at all times:

- Using the `$router` magic helper in Alpine components
- From Javascript using `window.PineconeRouter.context`
- Every `handler` method takes the context object as the only argument

Reference: 
-   _$router_.**route** _(/path/:var)_ The route set with `x-route`.
-   _$router_.**path** _(/path/something)_ The path visited by the client.
-   _$router_.**params** _({var: something})_ Object that contains route parameters if any.
-   _$router_.**hash** hash fragment without the #
-   _$router_.**query** search query without the ?
-   _$router_.**redirect(path: string)** function that allow you to redirect to another page.
-   -   **Note**: usage within [x-handler](#x-handler): `return context.redirect('/path');`
-   _$router_.**navigate(path: string)** same as clicking a link

> **Inside `x-handler`:** `context.params.id`, `context.route`, etc


## Redirecting

**From an Alpine component**:

-   use [`$router` magic helper](#magic-helper): `$router.navigate(path)`, `$router.redirect(path)`.

**Redirecting from a handler**:

To redirect from inside a handler function return the context's `redirect` method:

This will prevent any following handlers from executing

```js
handler(context) {
	...
	return context.redirect(path)
}
```

> **Remember**: inside the handler you _must_ **return** the `context.redirect()` function to redirect without running the next handlers.

> if you wish to prevent execution of any following handlers without redirecting, use `return 'stop'`

## Middlewares

Pinecone Router is extendable through middlewares!

Create your own middlewares [using this template](https://github.com/pinecone-router/middleware-template)!

## Settings:

```html
<script>
document.addEventListener('alpine:init', () => {
	window.PineconeRouter.settings.hash = false // use hash routing
	window.PineconeRouter.settings.basePath = '/' // set the base for the URL, doesn't work with hash routing
	window.PineconeRouter.settings.templateTargetId = 'app' // Set an optional ID for where the internal & external templates will render by default.
	window.PineconeRouter.settings.interceptLinks = truefalse // Set to false to disable global handling of links by the router, see Disable link handling globally for more.

})
</script>
```

## Advanced

### Bypass link handling

Adding a `native` / `data-native` attribute to a link will prevent Pinecone Router from handling it:

```html
<a href="/foo" native>Foo</a>
```


### Disable link handling globally

You can set `PineconeRouter.settings.interceptLinks` to false to disable handling links by the router, unless an `x-link` attribute is set on the link, or using `$router.navigate('/path')`.

```html
<script>
document.addEventListener('alpine:init', () => {
	window.PineconeRouter.settings.interceptLinks = false // Set to false to disable global handling of links by the router

})
</script>

<a href="/path">This will reload the page</a>
<a href="/path" x-link>This won't reload the page</a>
```


### Events / Loading bar

You can easily use [nProgress](http://ricostacruz.com/nprogress) with `x-template`:

```js
document.addEventListener('pinecone-start', () => NProgress.start());
document.addEventListener('pinecone-end', () => NProgress.done());
document.addEventListener('fetch-error', (err) => console.error(err));
```

| name               | recipient | when it is dispatched                        |
| ------------------ | --------- | -------------------------------------------- |
| **pinecone-start** | document  | when the template start fetching             |
| **pinecone-end**   | document  | when the fetching ends successfuly           |
| **fetch-error**    | document  | when the fetching of external templates fail |


### Adding and Removing routes & templates programmatically with Javascript

you can add routes & remove them anytime programmatically using Javascript.

**Adding a route**:

```js
window.PineconeRouter.add(path, options)
```

-   path: string, the route's path.
-   options: array of options:
```js
{handlers: [], template: '', templateTargetId: 'app'}
```

Note that by adding handlers this way you wont have access to the `this` of the alpine.js component if the handler is part of one.

**Adding a template**

You must set a templateTargetId in [settings](#settings):

```html
<script>
document.addEventListener('alpine:init', () => {
	window.PineconeRouter.settings.templateTargetId = 'app'
	window.PineconeRouter.add('/route', {template: '/route.html'})
	window.PineconeRouter.add('/notfound', {template: '/404.html'})
})
</script>
```
> Note: The template won't be cleared automatically until you access another route with a template, so make sure all your routes have one if you use this method.

**Removing a route**:

```js
window.PineconeRouter.remove(path)
```

-   path: string, the path of the route you want to remove.

**Navigating from Javascript**:

To navigate to another page from javascript you can use:

```js
window.PineconeRouter.context.navigate(path)
```

### Handling link clicks while handlers are in progress

If a user enter a link while handlers haven't finished yet, only the current one will finish while others will be canceled.

Make use of multiple handlers, for example one for fetching the data, 2nd one for redirecting if needed or displaying it.

This way if a user click a link while data is being fetched, the redirection handler wont be ran.


## Compatibility

| Version | Alpine.js Version |
| ------- | ----------------- |
| ^v2.x   | ^v3               |
| v1.x    | v2                |

## Contributing:

Please refer to [CONTRIBUTING.md](/CONTRIBUTING.md)

## Credits

This library uses modified chunks of code from [this tutorial](https://medium.com/swlh/lets-code-a-client-side-router-for-your-no-framework-spa-19da93105e10) & from [page.js](https://github.com/visionmedia/page.js).

## Acknowledgment

[@shaun/alpinejs-router](https://github.com/shaunlee/alpinejs-router/) for the entire template system implementation! I copied the code and adjusted it for this router including adding the target modifier and using a separate directive for `x-template` instead. Code is licensed under MIT.

[@KevinBatdorf](https://twitter.com/KevinBatdorf) for many ideas and early feedback!

> **Disclaimer**: Not affiliated with the Alpine.js team, developed independently.

## Versioning

This projects follow the [Semantic Versioning](https://semver.org/) guidelines.

## License

Copyright (c) 2024 Rafik El Hadi Houari and contributors

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/StillImage" property="dct:title" rel="dct:type">Pinecone Router <a href="https://github.com/pinecone-router/logo">Logo</a></span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://rehhouari.eu.org" property="cc:attributionName" rel="cc:attributionURL">Rafik El Hadi Houari</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

> Code from [Page.js](https://github.com/visionmedia/page.js#license) is licensed under the MIT License.
> Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>

> Code from [Simple-javascript-router tutorial](https://github.com/vijitail/simple-javascript-router/) is licensed under the MIT License.
> Copyright (c) 2021 Vijit Ail (https://github.com/vijitail).

> Route matching function from [Preact Router](https://github.com/preactjs/preact-router) is licensed under the MIT License.
> Copyright (c) 2015 Jason Miller
