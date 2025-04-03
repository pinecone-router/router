import { type PluginCallback, type Alpine } from 'alpinejs'

import TemplateDirective from './directives/x-template'
import HandlerDirective from './directives/x-handler'
import RouteDirective from './directives/x-route'
import { createPineconeRouter } from './router'
import { runPreloads } from './templates'
import { handleClicks } from './links'
import { settings } from './settings'

import { name, version } from '../package.json'

export const PineconeRouterPlugin: PluginCallback = function (Alpine: Alpine) {
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
