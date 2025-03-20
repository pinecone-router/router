import { type Alpine, type ElementWithXAttributes } from 'alpinejs'
import { PineconeRouter } from '~/router'
import { findRouteIndex } from '~/utils'
import {
	HANDLER_REQUIRES_ROUTE,
	INVALID_HANDLER_TYPE,
	PineconeRouterError,
} from '~/errors'

import { type Route } from '~/route'
import type { Handler } from '~/handler'

export const HandlerDirective = (Alpine: Alpine, Router: PineconeRouter) => {
	Alpine.directive(
		'handler',
		(
			el: ElementWithXAttributes,
			{ expression, modifiers },
			{ evaluate, cleanup },
		) => {
			if (!modifiers.includes('global') && !el._x_PineconeRouter_route) {
				throw new PineconeRouterError(HANDLER_REQUIRES_ROUTE)
			}

			let handlers: Handler[]

			// check if the handlers expression is an array
			// if not make it one
			if (
				!(expression.startsWith('[') && expression.endsWith(']')) &&
				!(expression.startsWith('Array(') && expression.endsWith(')'))
			) {
				expression = `[${expression}]`
			}

			let evaluatedExpression = evaluate(expression)

			if (typeof evaluatedExpression == 'object')
				handlers = evaluatedExpression as Handler[]
			else
				throw new PineconeRouterError(
					INVALID_HANDLER_TYPE(typeof evaluatedExpression),
				)

			// add `this` context for handlers inside an Alpine.component
			for (let index = 0; index < handlers.length; index++) {
				handlers[index] = handlers[index].bind(Alpine.$data(el))
			}

			let route: Route

			if (modifiers.includes('global')) {
				Router.globalHandlers = handlers
			} else {
				// add handlers to the route
				let path = el._x_PineconeRouter_route!
				route =
					path == 'notfound'
						? Router.notfound
						: Router.routes[findRouteIndex(path, Router.routes)]
				route.handlers = handlers
			}

			cleanup(() => {
				if (modifiers.includes('global')) {
					Router.globalHandlers = []
				} else {
					route.handlers = []
					route.handlersDone = true
					route.cancelHandlers = false
				}
			})
		},
	).before('template')
}
