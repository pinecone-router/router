import { type PluginCallback, type Alpine } from 'alpinejs'

import { createPineconeRouter, type PineconeRouter } from './router'
import { TemplateDirective } from './directives/x-template'
import { HandlerDirective } from './directives/x-handler'
import { RouteDirective } from './directives/x-route'
import { interceptLinks } from './links'
import { type Context } from './context'

declare global {
	interface Window {
		PineconeRouter: PineconeRouter
		Alpine: Alpine
	}
}

declare module 'alpinejs' {
	interface XAttributes {
		_x_PineconeRouter_templateUrls: string[]
		_x_PineconeRouter_template: HTMLElement[]
		_x_PineconeRouter_scripts: HTMLScriptElement[]
		_x_PineconeRouter_undoTemplate: () => void
		_x_PineconeRouter_route: string
	}
	interface Alpine {
		$router: PineconeRouter
		$params: Context['params']
	}
	interface Magics<T> {
		$router: PineconeRouter
		$params: Context['params']
	}
}

const PineconeRouterPlugin: PluginCallback = function (Alpine: Alpine) {
	const Router = Alpine.reactive(createPineconeRouter('7.0.0'))
	window.PineconeRouter = Router

	// Initialize event listeners (equivalent to constructor)
	document.addEventListener('alpine:initialized', () => {
		// virtually navigate to the path on the first page load
		// this will register the path in history and sets the path variable
		if (Router.settings.hash == false) {
			Router.navigate(location.pathname + location.search, false, true)
		} else {
			Router.navigate(location.hash.substring(1), false, true)
		}
	})

	// handle navigation events not emitted by links, for example, back button.
	window.addEventListener('popstate', () => {
		if (Router.settings.hash) {
			if (window.location.hash != '') {
				Router.navigate(window.location.hash.substring(1), true)
			}
		} else {
			Router.navigate(window.location.pathname, true)
		}
	})

	TemplateDirective(Alpine, Router)
	HandlerDirective(Alpine, Router)
	RouteDirective(Alpine, Router)

	Alpine.$router = Router
	Alpine.$params = Router.context.params
	Alpine.magic('router', () => Router)
	Alpine.magic('params', () => Router.context.params)

	// intercept click event in links
	interceptLinks(Router)
}

export default PineconeRouterPlugin
