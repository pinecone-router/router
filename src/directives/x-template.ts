import { type Alpine } from 'alpinejs'

import { hide, interpolate, load, show } from '../templates'
import { getTargetELement, modifierValue } from '../utils'
import { PineconeRouter } from '../router'
import { assertExpressionIsArray, assertRouteTemplate } from '../errors'

const TemplateDirective = (Alpine: Alpine, Router: PineconeRouter) => {
	Alpine.directive(
		'template',
		(el, { expression, modifiers }, { evaluate, cleanup, Alpine, effect }) => {
			assertRouteTemplate(el)

			const targetEl = getTargetELement(
				modifierValue(modifiers, 'target'),
				Router.settings.targetID
			)

			// add template to the route
			const path = el._x_PineconeRouter_route

			let urls: string[]

			// only process the expression if it is not empty
			// this allows inline templates to be used without an expression
			if (expression != '') {
				expression = expression.trim()
				if (
					!(expression.startsWith('[') && expression.endsWith(']')) &&
					!(expression.startsWith('Array') && expression.endsWith(')'))
				) {
					expression = `['${expression}']`
				}

				const evaluatedExpression = evaluate(expression)

				assertExpressionIsArray(evaluatedExpression)

				urls = evaluatedExpression as string[]

				if (modifiers.includes('preload')) {
					load(urls, el)
				}

				const route = Router.routes.get(path)!
				route.templates = urls
			}

			const callback = (urls?: string[]) => {
				const found = Router.context.route.path == path
				if (found) {
					if (urls && modifiers.includes('interpolate')) {
						urls = interpolate(urls, Router.context.params)
					}
					show(Alpine, el, expression, urls, targetEl)
				} else hide(el)
			}

			Alpine.nextTick(() => effect(() => callback(urls)))

			cleanup(() => {
				el._x_PineconeRouter_undoTemplate && el._x_PineconeRouter_undoTemplate()
			})
		}
	)
}

export default TemplateDirective
