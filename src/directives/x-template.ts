import { type ElementWithXAttributes, type Alpine } from 'alpinejs'

import { getTargetELement, findRouteIndex, modifierValue } from '../utils'
import { hide, interpolate, load, show } from '../templates'
import { PineconeRouter } from '../router'
import {
	DIRECTIVE_REQUIRES_TEMPLATE_ELEMENT,
	INVALID_TEMPLATE_TYPE,
	TEMPLATE_WITH_CHILD,
	PineconeRouterError,
	DIRECTIVE_REQUIRES_ROUTE,
} from '../errors'

export const TemplateDirective = (Alpine: Alpine, Router: PineconeRouter) => {
	Alpine.directive(
		'template',
		(
			el: ElementWithXAttributes,
			{ expression, modifiers },
			{ evaluate, cleanup, Alpine, effect },
		) => {
			if (!(el instanceof HTMLTemplateElement)) {
				throw new PineconeRouterError(DIRECTIVE_REQUIRES_TEMPLATE_ELEMENT)
			}

			const template = el as ElementWithXAttributes<HTMLTemplateElement>

			if (template.content.firstElementChild != null)
				throw new PineconeRouterError(TEMPLATE_WITH_CHILD)

			expression = expression.trim()
			if (
				!(expression.startsWith('[') && expression.endsWith(']')) &&
				!(expression.startsWith('Array') && expression.endsWith(')'))
			) {
				expression = `['${expression}']`
			}

			const evaluatedExpression = evaluate(expression)

			let urls: string[]

			if (
				typeof evaluatedExpression == 'object' &&
				Array.isArray(evaluatedExpression)
			)
				urls = evaluatedExpression
			else {
				throw new PineconeRouterError(
					INVALID_TEMPLATE_TYPE(typeof evaluatedExpression),
				)
			}

			const targetEl = getTargetELement(
				modifierValue(modifiers, 'target'),
				Router.settings.templateTargetId,
			)

			if (modifiers.includes('preload')) {
				load(urls, template)
			}

			if (template._x_PineconeRouter_route == undefined) {
				throw new PineconeRouterError(DIRECTIVE_REQUIRES_ROUTE('template'))
			}

			// add template to the route
			const path = template._x_PineconeRouter_route

			const route =
				path == 'notfound'
					? Router.notfound
					: Router.routes[findRouteIndex(path, Router.routes)]

			route.templates = urls

			const callback = () => {
				const found = Router.handlersDone && Router.context.route == route
				if (found) {
					if (modifiers.includes('interpolate')) {
						urls = interpolate(route.templates, Router.context.params)
					}
					show(Alpine, Router, template, expression, urls, targetEl)
				} else hide(template)
			}

			Alpine.nextTick(() => effect(callback))

			cleanup(() => {
				template._x_PineconeRouter_undoTemplate &&
					template._x_PineconeRouter_undoTemplate()
			})
		},
	)
}
