import { NavigationHistory } from './history'
import { PineconeRouter } from './router'
import { Context } from './context'

/// Extend Window interface

declare global {
	interface Window {
		PineconeRouter: PineconeRouter
	}
}

/// Extend Alpine.js types

declare module 'alpinejs' {
	interface XAttributes {
		_x_PineconeRouter_undoTemplate: () => void
		_x_PineconeRouter_template: HTMLElement[]
		_x_PineconeRouter_templateUrls: string[]
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

/// Exports

// Types from handler.ts
export { Handler, HandlerContext } from './handler'

// Types from context.ts
export { Context } from './context'

// Types from route.ts
export { Route, RouteOptions, MatchResult } from './route'

// Types from router.ts
export { PineconeRouter, RoutesMap } from './router'

// Types from history.ts
export { NavigationHistory } from './history'

// Types from settings.ts
export { Settings } from './settings'

// Types from templates.ts
// No explicit interfaces to export

// Types from links.ts
// No explicit interfaces to export

// Types from errors.ts
// Error messages and assertions only, no types to export

// Types from utils.ts
// Utility functions only, no types to export

// Types from directives/x-route.ts
export { RouteTemplate } from './directives/x-route'

// Types from directives/x-handler.ts
// No additional types to export

// Types from directives/x-template.ts
// No additional types to export

export { PineconeRouterPlugin, PineconeRouterPlugin as default } from './index'
