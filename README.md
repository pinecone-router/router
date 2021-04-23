<p align="center">
  <img src="logo/alpine-router-readme.png" height="275" title="Alpine Router logo with the text "A simple client-side router for Alpine.js">
</p>

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/rehhouari/alpine-router?color=%2337C8AB&label=version&sort=semver)
![GitHub file size in bytes](https://img.shields.io/github/size/rehhouari/alpine-router/dist/complete.js?color=%2337C8AB)
![Downloads from Jsdelivr](https://img.shields.io/jsdelivr/gh/hm/rehhouari/alpine-router?color=%2337C8AB&logoColor=%2337C8AB)
[![Changelog](https://img.shields.io/badge/change-log-%2337C8AB)](/CHANGELOG.md)

# Alpine Router

The simple client-side router for Alpine.js.

## About

An easy to use but feature-packed client-router for use with Alpine.js.
It can be used to handle routes manually, render specific views, and automatically render server-rendered pages-with preload!

## Features:

-   Easy and familiar syntax well integrated with Alpine.js.
-   Automatically dispatch relative links and handle them ([optional](#settings)).
-   [Hash routing](#hash-routing)!
-   [Render pages](#page-rendering): automatically load server-rendered pages with preloading (like turbolinks, optional)
-   [Render views](#views-rendering): manually set the view for each route and have it rendered! (optional)
-   Easily tweakable through many [Settings](#settings)!

## Installation

It works but not ready for production yet, **[needs reviewing and more testing, help welcome!](#contributing)**

### CDN

Include the following `<script>` tag in the `<head>` of your document:

```html
<script src="https://cdn.jsdelivr.net/gh/rehhouari/alpine-router@0.0.4/dist/complete.umd.js"></script>
```

**ES6 Module:**

```javascript
import 'https://cdn.jsdelivr.net/gh/rehhouari/alpine-router@0.0.4/dist/complete.module.js';
```

> **Important**: This must be added **before** loading Alpine.js.

> **Note**: [Smaller, feature-specific builds](#contributing) will be available soon ^^

## Usage

### Handle routes

-   Create an Alpine component with the `x-router` attribute.
-   Declare routes by creating a template tag with `x-route` and `x-handler` attributes.
-   The `x-handler` must be a method of the router component.

```html
<div x-data="handle()" x-router>
	<template x-route="/hello/:name" x-handler="hello"></template>
	<template x-route="/" x-handler="main"></template>
	<template x-route="notfound" x-handler="notfound"></template>
</div>
```

> **Important**: There can only be one router in the page!

```js
function handle() {
	return {
		main() {
			console.log('main');
		},
		hello(context) {
			console.log('hello,', context.props.name);
		},
		notfound(context) {
			console.error(context.path + ' is not found');
		},
	};
}
```

#### Context Object

The handler takes `context` which consist of:

-   context.route (/path/:var)
-   context.path (/path/something)
-   context.props ({var: something})
-   context.hash (hash fragment without the #)
-   context.query (search query without the ?)

### Hash routing

You may use hash routing by simply adding `x-hash` attribute to the router component:

```html
<div x-data="handle()" x-router x-hash>...</div>
```

### Page rendering

You can use Alpine Router to render server generated pages without reloads!

```html
<div x-data x-router x-render></div>
```

By default this will fetch the whole page and replaces the `<body>` content.
To use antoher element instead, set its selector: `x-render="#content"`.

#### Handling routes while using x-render

You can also handle routes while all pages render normally!

```html
<div x-data="handle()" x-router x-render>
	<template x-route="/hello/:name" x-handler="hello"></template>
</div>
```

> **Note**: The routes will be handled _before_ the page is rendered.

#### Notfound and specifying routes

By default, 404 pages are left to the server to handle. However, if you'd like to specify the routes allowed, you can do it like this:

```html
<div x-data="handle()" x-router x-render>
	<template x-route="/"></template>
	<template x-route="/hello/:name"></template>
	<template x-route="notfound" x-handler="notfound"></template>
</div>
```

As you see, the handler is optional on routes as the page will be rendered
regardless, but you can add it if you need it.

**Notes:**
By default routes not found _will_ be pushed to history.
That can be prevented by setting `AlpineRouter.settings.pushNotfoundToHistory = false`.

### Views rendering

Unlike page rendering, you get to specify the view for each route.

-   Routes can share views.
-   View are simply html files.
-   Can specify selector as well.

```html
<div x-data x-router x-views="#content">
	<template x-route="/" x-view="/home.html"></template>
	<template x-route="/hello/:name" x-view="/hello.html"></template>
	<template x-route="notfound" x-view="/404.html"></template>
</div>
```

> **Notes:** :

-   A view is **required** for each route.
-   You can _cache_ views if they're static and not dynamically generated by adding `x-static` to the router:
-   -   `<div x-data x-router x-views x-static>`
-   You can set the selector by specifying it `x-views`. leaving it empty will default to '#content'.
-   You can also handle routes while using views
-   -   **Note**: The routes will be handled _before_ the page is rendered.

> **Tip!** To access the current context (props etc) from within the views, use `AlpineRouter.currentContext`.

> **Important**: Make sure the view don't have an Alpine Router component in it! Keep the router component outside of the specified selector.
> Can't use 'body' as the selector to avoid that issue.

### Redirecting

You can navigate to another page by calling `AlpineRouter.navigate(path)` with path being the path you want to navigate to.

### Settings:

There are a few settings you may tweak for your liking.

To access or set them from javascript, use `AlpineRouter.settings.name = value`.<br>with name being the name of the settings as seen bellow:

| name                      | default | description                                                               |
| ------------------------- | ------- | ------------------------------------------------------------------------- |
| **interceptLinks**        | _true_  | whether or not to intercept links                                         |
| **pushNotfoundToHistory** | _true_  | whether or not paths that are not found should be pushed to history       |
| **render.preload**        | _true_  | whether to preload pages on mouse over links                              |
| **render.preloadtime**    | _200_   | time to wait to preload pages on mouse over links                         |
| **views.static**          | _false_ | views are not dynamically generated, this will cache views for later use. |

**Base path:** is set with the `x-base` attribute.
**Trailing slash:** `x-slash="add"` or empty to force adding trailing slash or `x-slash="remove"` to force removing them.

### Events:

Alpine Router dispatch these events:

| name             | recipient | description                                |
| ---------------- | --------- | ------------------------------------------ |
| **routerloaded** | window    | when the router and routes are initialized |
| **loadstart**    | window    | when the page start loading                |
| **loadend**      | window    | when the page loading ends                 |

### Global Context

You can access current path's [context](#context-object) from anywhere in your javascript by accessing `AlpineRouter.currentContext`.

## Contributing:

Please open [issues](https://github.com/rehhouari/alpine-router/issues) or [discussions](https://github.com/rehhouari/alpine-router/discussions) about any problems, suggestions, questions you have!
Want to contribute to code? please do!

**things you can do!**

-   make a simple middleware system to turn x-render and x-views into pluggable middlewares!
-   -   in the source i added `//X-FEATURE ONLY` and `//X-FEATURE END` comments around blocks of code for a specific feature
        in order to show which parts can be removed for exmaplee to make smaller builds.
- a magic helper `$router` to access current [global context](#global-context)
-   add tests, I don't know where to start tbh and I'll appreciate it :)
-   improve documentation.

**things to keep in mind:**

-   if you use VS Code or Codium, use Prettier extension and load the `.prettierrc` settigs file.

## Credits

This library uses modified chunks of code from [this tutorial](https://medium.com/swlh/lets-code-a-client-side-router-for-your-no-framework-spa-19da93105e10) & from [page.js](https://github.com/visionmedia/page.js). The parts used are speficied in [source comments](src/).

## Acknowledgment

@KevinBatdorf for the page rendering idea and early feedback!

## Versioning

This projects follow the [Semantic Versioning](https://semver.org/) guidelines.

## License

Copyright (c) 2021 Rafik El Hadi Houari and contributors

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.

> Code from [Page.js](https://github.com/visionmedia/page.js#license) is licenced under the MIT License.
> Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>

> Code from [Simple-javascript-router tutorial](https://github.com/vijitail/simple-javascript-router/) is licenced under the MIT License.
> Copyright (c) 2021 Vijit Ail (https://github.com/vijitail).
