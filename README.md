# Alpine Router

A simple router for Alpine.js. (WIP)

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/rehhouari/alpine-router?label=version&style=flat-square)
![GitHub file size in bytes](https://img.shields.io/github/size/rehhouari/alpine-router]/dist/alpine-router.js?label=min%20%28no%20gzip%29&style=flat-square)
[![Monthly downloads via CDN](https://data.jsdelivr.com/v1/package/gh/[repo]/badge)](https://www.jsdelivr.com/package/gh/rehhouari/alpine-router)

## About

A simple router for use with Alpine.js.

## Installation

### CDN

Include the following `<script>` tag in the `<head>` of your document:

```html
<script src="https://cdn.jsdeliver.com/gh/rehhouari/alpine-router/dist/alpine-router.umd.min.js"></script>
```

## Usage

Create an Alpine component with the `x-router` attribute

The routers will be children with the `x-route` and `x-handler` attributes

The `x-handler` must be a method of the router component.

```html
<div x-data="handle()" x-router>
	<template x-route="/hello/:name" x-handler="hello"></template>
	<template x-route="/" x-handler="main"></template>
	<template x-route="notfound" x-handler="notfound"></template>
</div>
```

The handler takes `props` as an argument which will have path variales.

```js
function handle() {
	return {
		main(props) {
			console.log('main');
		},
		hello(props) {
			console.log('hello,', props.name);
		},
		notfound(props) {
			console.log('not found');
		},
	};
}
```

> **Important**: This must be added **before** loading Alpine.js.

## Versioning

This projects follow the [Semantic Versioning](https://semver.org/) guidelines.

## License

Copyright (c) 2020 Rafik El Hadi Houari and contributors

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.
