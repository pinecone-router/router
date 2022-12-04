import { Context } from './types'

var isLocation = window.location

/**
 * taken from preact-router
 * https://github.com/preactjs/preact-router
 * @param url url to segmentize
 * @returns
 */
function segmentize(url: string): string[] {
	return url.replace(/(^\/+|\/+$)/g, '').split('/')
}

/**
 * check if a path match with this route
 * taken from preact-router
 * https://github.com/preactjs/preact-router
 * @param path {string}
 * @param routePath {string}
 * @returns {false|object}
 */
export function match(url: string, routePath: string): false | object {
	let reg = /(?:\?([^#]*))?(#.*)?$/,
		c = url.match(reg),
		matches: any = {},
		ret
	if (c && c[1]) {
		let p = c[1].split('&')
		for (let i = 0; i < p.length; i++) {
			let r = p[i].split('=')
			matches[decodeURIComponent(r[0])] = decodeURIComponent(
				r.slice(1).join('=')
			)
		}
	}
	let urlSeg = segmentize(url.replace(reg, '')),
		route: string[] = segmentize(routePath || ''),
		max = Math.max(urlSeg.length, route.length)
	for (let i = 0; i < max; i++) {
		if (route[i] && route[i].charAt(0) === ':') {
			let param: string = route[i].replace(/(^:|[+*?]+$)/g, ''),
				flags: string = (route[i].match(/[+*?]+$/) || {}).toString()[0],
				plus = ~flags.indexOf('+'),
				star = ~flags.indexOf('*'),
				val = urlSeg[i] || ''
			if (!val && !star && (flags.indexOf('?') < 0 || plus)) {
				ret = false
				break
			}
			matches[param] = decodeURIComponent(val)
			if (plus || star) {
				matches[param] = urlSeg
					.slice(i)
					.map(decodeURIComponent)
					.join('/')
				break
			}
		} else if (route[i] !== urlSeg[i]) {
			ret = false
			break
		}
	}
	if (ret === false) return false
	return matches
}

/**
 * Convert to a URL object
 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
 */
function toURL(href: string): URL | HTMLAnchorElement {
	if (typeof URL === 'function' && isLocation) {
		return new URL(href, window.location.toString())
	} else {
		var anc = window.document.createElement('a')
		anc.href = href
		return anc
	}
}

/**
 * Check if `href` is the same origin.
 * https://github.com/visionmedia/page.js/blob/4f9991658f9b9e3de9b6059bade93693af24d6bd/page.js#L888
 */
export function sameOrigin(href: string) {
	if (!href || !isLocation) return false

	var url = toURL(href)
	var loc = window.location

	/*
    When the port is the default http port 80 for http, or 443 for
    https, internet explorer 11 returns an empty string for loc.port,
    so we need to compare loc.port with an empty string if url.port
    is the default port 80 or 443.
    Also the comparison with `port` is changed from `===` to `==` because
    `port` can be a string sometimes. This only applies to ie11.
    */
	return (
		loc.protocol === url.protocol &&
		loc.hostname === url.hostname &&
		(loc.port === url.port ||
			(loc.port === '' && (url.port == '80' || url.port == '443')))
	) // jshint ignore:line
}

export function samePath(url: any) {
	if (!isLocation) return false
	var loc = window.location
	return url.pathname === loc.pathname && url.search === loc.search
}

/**
 * Check if the anchor element point to a navigation route.
 * @param {any} el The anchor element or Event target
 * @param {boolean} hash Set to true when using hash routing
 * @returns {object} {valid: boolean, link: string}
 */
export function validLink(
	el: any,
	hash: boolean
): { valid: boolean; link: string } {
	// the object we'll return
	let ret = { valid: false, link: '' }

	// The checks in this block are taken from
	// https://github.com/visionmedia/page.js/blob/master/index.js#L370

	// continue ensure link

	// el.nodeName for svg links are 'a' instead of 'A'
	// traverse up till we find an anchor tag, since clicks
	// on image links for example set the target as img instead of a.
	while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode
	if (!el || 'A' !== el.nodeName.toUpperCase()) return ret

	// check if link is inside an svg
	// in this case, both href and target are always inside an object
	var svg =
		typeof el.href === 'object' &&
		el.href.constructor.name === 'SVGAnimatedString'

	// Ignore if tag has
	// 1. "download" attribute
	// 2. rel="external" attribute
	if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') {
		return ret
	}

	// ensure non-hash for the same path
	ret.link = el.getAttribute('href') ?? ''
	if (!hash && samePath(el) && (el.hash || '#' === ret.link)) {
		return ret
	}

	// Check for mailto: in the href
	if (ret.link && ret.link.indexOf('mailto:') > -1) return ret

	// check target
	// svg target is an object and its desired value is in .baseVal property
	if (svg ? el.target.baseVal : el.target) return ret

	// x-origin
	// note: svg links that are not relative don't call click events (and skip page.js)
	// consequently, all svg links tested inside page.js are relative and in the same origin
	if (!svg && !sameOrigin(el.href)) return ret

	ret.valid = true
	return ret
}

/**
 * execute the handlers of routes that are given passing them the context.
 */
export function handle(handlers, context) {
	for (let i = 0; i < handlers.length; i++) {
		if (typeof handlers[i] == 'function') {
			let result = handlers[i](context)
			// if the handler redirected, return
			if (result == 'stop') return false
		}
	}
	return true
}

/**
 * Call a function on all middlewares loaded, if any.
 * @param {string} func middleware function to call.
 * @param {any} args arguments to pass to the function.
 * @returns {boolean} false if the middleware function return false, i.e. it want to stop execution of the function and return.
 */
export function middleware(func: string, ...args: any): string | undefined {
	if (!window.PineconeRouterMiddlewares) return
	for (const i in window.PineconeRouterMiddlewares) {
		let plugin: any = window.PineconeRouterMiddlewares[i]
		if (plugin[func] == null) return
		let ret = plugin[func](...args)
		// the return of the function will only be 'stop'
		// if the middleware request stopping the navigate function.
		if (ret == 'stop') return 'stop'
	}
}

/**
 * This will replace the content fetched from `path` into `selector`.
 * The content is assumed to not be an entire html page but a chunk of it.
 */
export function renderContent(
	content: string,
	selector = window.PineconeRouter.settings.viewSelector
) {
	// replace the content of the selector with the fetched content
	document.querySelector(selector)!.innerHTML = content
	// @ts-ignore
	document.querySelector('[autofocus]')?.focus()
}
