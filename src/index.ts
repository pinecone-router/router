import { type PluginCallback, type Alpine } from 'alpinejs'

import { createPineconeRouter, type PineconeRouter } from './router'
import TemplateDirective from './directives/x-template'
import HandlerDirective from './directives/x-handler'
import { type NavigationHistory } from './history'
import RouteDirective from './directives/x-route'
import { runPreloads } from './templates'
import { type Context } from './context'
import { handleClicks } from './links'
import { settings } from './settings'

import { name, version } from '../package.json'

declare global {
	interface Window {
		PineconeRouter: PineconeRouter
	}
}

// This extends the alpinejs types
// Adding our custom magics and html attributes
// This allows the user to extend AlpineComponent with $router and $params
// already set.
declare module 'alpinejs' {
	interface XAttributes {
		_x_PineconeRouter_templateUrls: string[]
		_x_PineconeRouter_template: HTMLElement[]
		_x_PineconeRouter_scripts: HTMLScriptElement[]
		_x_PineconeRouter_undoTemplate: () => void
		_x_PineconeRouter_route: string
	}

	interface Magics<T> {
		$router: PineconeRouter
		$history: NavigationHistory
		$params: Context['params']
	}

	interface Alpine {
		$router: PineconeRouter
	}
}

const PineconeRouterPlugin: PluginCallback = function (Alpine: Alpine) {
	const Router = Alpine.reactive(createPineconeRouter(name, version))

	window.PineconeRouter = Router

	// Initialize event listeners (equivalent to constructor)
	document.addEventListener('alpine:initialized', () => {
		// virtually navigate to the path on the first page load
		// this will register the path in history and sets the path variable
		if (settings.hash == false) {
			Router.navigate(location.pathname + location.search, false, true)
		} else {
			Router.navigate(location.hash.substring(1), false, true)
		}
	})

	// handle navigation events not emitted by links, for example, back button.
	window.addEventListener('popstate', () => {
		if (settings.hash) {
			if (window.location.hash != '') {
				Router.navigate(window.location.hash.substring(1), true)
			}
		} else {
			Router.navigate(window.location.pathname, true)
		}
	})

	// intercept click event in links
	handleClicks(Router)

	// run preloads once when page fully loads.
	document.addEventListener(
		'pinecone:end',
		() => Alpine.nextTick(runPreloads),
		{
			once: true,
		}
	)

	// order matters in order to use directive.before()
	// this makes sure the order is as follows:
	// x-route -> x-handler -> x-template
	TemplateDirective(Alpine, Router)
	HandlerDirective(Alpine, Router)
	RouteDirective(Alpine, Router)

	// register the router as a global variable
	Alpine.$router = Router

	// register magic helpers
	Alpine.magic('router', () => Router)
	Alpine.magic('history', () => Router.history)
	Alpine.magic('params', () => Router.context.params)
}

export default PineconeRouterPlugin
