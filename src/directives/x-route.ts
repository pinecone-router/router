import { type ElementWithXAttributes, type Alpine } from 'alpinejs'

import { PineconeRouter } from '../router'
import { assertTemplate } from '../errors'
import { addBasePath } from '../utils'
import { settings } from '../settings'

export interface RouteTemplate
	extends ElementWithXAttributes<HTMLTemplateElement> {
	_x_PineconeRouter_route: string
}

const RouteDirective = (Alpine: Alpine, Router: PineconeRouter) => {
	Alpine.directive('route', (el, { expression }, { cleanup }) => {
		let path = addBasePath(expression, settings.basePath)

		assertTemplate(el)

		if (path != 'notfound') {
			// register the new route if possible
			Router.add(path, {})
		}

		// set the path in the element so it is used by other directives
		el._x_PineconeRouter_route = path

		cleanup(() => {
			Router.routes.delete(path)
			delete el._x_PineconeRouter_route
		})
	}).before('handler')
}

export default RouteDirective
