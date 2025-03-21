import { type PluginCallback, type Alpine } from 'alpinejs'

import { createPineconeRouter, PineconeRouter } from '~/router'
import { TemplateDirective } from '~/directives/x-template'
import { HandlerDirective } from '~/directives/x-handler'
import { RouteDirective } from '~/directives/x-route'
import { interceptLinks } from '~/links'
import { type Context } from '~/context'

declare global {
	interface Window {
		PineconeRouter: PineconeRouter
	}
}

declare module 'alpinejs' {
	interface XAttributes {
		_x_PineconeRouter_TemplateUrls: string[]
		_x_PineconeRouter_Template: HTMLElement[]
		_x_PineconeRouter_undoTemplate: () => void
		_x_PineconeRouter_route: string
	}
	interface Alpine {
		$router: PineconeRouter
		$params: Record<string, string>
	}
	interface Magics<T> {
		$router: Context
		$params: Record<string, string>
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
	Alpine.$params = Router.context.params || {}
	Alpine.magic('router', () => Router)
	Alpine.magic('params', (_, { Alpine }) => Alpine.$params)

	// intercept click event in links
	interceptLinks(Router)
}

export default PineconeRouterPlugin
