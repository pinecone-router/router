import { type Alpine } from 'alpinejs'
import { PineconeRouter } from '../router'
import { assertExpressionIsArray, assertRouteTemplate } from '../errors'

import { type Route } from '../route'
import type { Handler } from '../handler'
import { settings } from '../settings'
import { isArrayExpression } from '../utils'

const HandlerDirective = (Alpine: Alpine, Router: PineconeRouter) => {
	Alpine.directive(
		'handler',
		(el, { expression, modifiers }, { evaluate, cleanup }) => {
			// check if the handlers expression is an array
			// if not make it one
			if (!isArrayExpression(expression)) {
				expression = `[${expression}]`
			}

			const evaluatedExpression = evaluate(expression)

			assertExpressionIsArray(evaluatedExpression)

			let handlers = evaluatedExpression as Handler<unknown, unknown>[]

			// add `this` context for handlers inside an Alpine.component
			for (let i = 0; i < handlers.length; i++) {
				handlers[i] = handlers[i].bind(Alpine.$data(el))
			}

			let route: Route

			if (modifiers.includes('global')) {
				settings.globalHandlers = handlers
			} else {
				assertRouteTemplate(el)

				// add handlers to the route
				let path = el._x_PineconeRouter_route
				route = Router.routes.get(path)!
				route.handlers = handlers
			}

			cleanup(() => {
				if (modifiers.includes('global')) {
					settings.globalHandlers = []
				} else {
					route.handlers = []
				}
			})
		}
	).before('template')
}

export default HandlerDirective
