import { type ElementWithXAttributes, type Alpine } from 'alpinejs'

import { getTargetELement, modifierValue, addBasePath } from '../utils'
import { PineconeRouter } from '../router'
import { show, hide } from '../templates'
import {
	DIRECTIVE_REQUIRES_TEMPLATE_ELEMENT,
	PineconeRouterError,
} from '../errors'

export const RouteDirective = (Alpine: Alpine, Router: PineconeRouter) => {
	Alpine.directive(
		'route',
		(
			el: ElementWithXAttributes,
			{ expression, modifiers },
			{ cleanup, effect },
		) => {
			let path = expression

			if (!(el instanceof HTMLTemplateElement)) {
				throw new PineconeRouterError(DIRECTIVE_REQUIRES_TEMPLATE_ELEMENT)
			}

			const template = el as ElementWithXAttributes<HTMLTemplateElement>

			const targetEl = getTargetELement(
				modifierValue(modifiers, 'target'),
				Router.settings.templateTargetId,
			)

			let routeIndex: number | undefined

			if (path != 'notfound') {
				// if specified add the basePath
				path = addBasePath(path, Router.settings.basePath)
				// register the new route if possible
				routeIndex = Router.add(path, {})
			}

			const route =
				routeIndex != undefined ? Router.routes[routeIndex] : Router.notfound

			// set the path in the element so it is used by other directives
			template._x_PineconeRouter_route = path

			if (template.content.childElementCount) {
				Alpine.nextTick(() => {
					effect(() => {
						const found = Router.handlersDone && Router.context.route == route

						found
							? show(Alpine, Router, template, expression, undefined, targetEl)
							: hide(template)
					})
				})
			}

			cleanup(() => {
				template._x_PineconeRouter_undoTemplate &&
					template._x_PineconeRouter_undoTemplate()
				if (routeIndex != undefined) {
					delete Router.routes[routeIndex]
				}
				delete template._x_PineconeRouter_route
			})
		},
	).before('handler')
}
