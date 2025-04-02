import { type Alpine } from 'alpinejs'

import { assertExpressionIsArray, assertRouteTemplate } from '../errors'
import { hide, interpolate, preload, show } from '../templates'
import { getTargetELement, isArrayExpression, modifierValue } from '../utils'
import { PineconeRouter } from '../router'
import { settings } from '../settings'

const TemplateDirective = (Alpine: Alpine, Router: PineconeRouter) => {
	Alpine.directive(
		'template',
		(el, { expression, modifiers }, { evaluate, cleanup, Alpine, effect }) => {
			assertRouteTemplate(el)

			const targetEl = getTargetELement(
				modifierValue(modifiers, 'target'),
				settings.targetID
			)

			const path = el._x_PineconeRouter_route
			let urls: string[]
			const interpolated = modifiers.includes('interpolate')

			// only process the expression if it is not empty
			// this allows inline templates to be used without an expression
			if (expression != '') {
				if (!isArrayExpression(expression)) {
					expression = `['${expression}']`
				}

				const evaluatedExpression = evaluate(expression)
				assertExpressionIsArray(evaluatedExpression)
				urls = evaluatedExpression as string[]

				if (
					!interpolated &&
					(settings.preload || modifiers.includes('preload'))
				) {
					preload(urls, el)
				}

				const route = Router.routes.get(path)!
				route.templates = urls
			}

			const callback = (urls?: string[]) => {
				const found = Router.context.route === path
				if (found) {
					if (urls && interpolated) {
						urls = interpolate(urls, Router.context.params)
					}
					show(Alpine, el, expression, urls, targetEl).then(() => {
						Router.loading = false
					})
				} else hide(el)
			}

			effect(() => callback(urls))

			cleanup(() => {
				el._x_PineconeRouter_undoTemplate && el._x_PineconeRouter_undoTemplate()
			})
		}
	)
}

export default TemplateDirective
