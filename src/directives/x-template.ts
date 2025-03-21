import { type ElementWithXAttributes, type Alpine } from 'alpinejs'

import { getTargetELement, findRouteIndex, modifierValue } from '~/utils'
import { hide, interpolate, load, show } from '~/templates'
import { PineconeRouter } from '~/router'
import {
	DIRECTIVE_REQUIRES_TEMPLATE_ELEMENT,
	TEMPLATE_REQUIRES_ROUTE,
	INVALID_TEMPLATE_TYPE,
	PineconeRouterError,
	TEMPLATE_WITH_CHILD,
} from '~/errors'

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
				throw new PineconeRouterError(TEMPLATE_REQUIRES_ROUTE)
			}

			// add template to the route
			const path = template._x_PineconeRouter_route

			const route =
				path == 'notfound'
					? Router.notfound
					: Router.routes[findRouteIndex(path, Router.routes)]

			route.templates = urls

			Alpine.nextTick(() => {
				effect(() => {
					const found = route.handlersDone && Router.context.route == route
					if (found) {
						if (modifiers.includes('interpolate')) {
							urls = interpolate(route.templates, route.params)
						}
						show(Alpine, Router, template, expression, urls, targetEl)
					} else hide(template)
				})
			})

			cleanup(() => {
				template._x_PineconeRouter_undoTemplate &&
					template._x_PineconeRouter_undoTemplate()
			})
		},
	)
}
