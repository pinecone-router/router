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
	Alpine.directive('route', (el, { expression, value }, { cleanup }) => {
		let path = settings.hash ? expression : addBasePath(expression)

		assertTemplate(el)

		if (path != 'notfound') {
			Router.add(path, { name: value })
		}

		// set the path in the element so it is used by other directives
		el._x_PineconeRouter_route = path

		cleanup(() => {
			el.removeAttribute('x-template')
			el.removeAttribute('x-handler')
			Router.remove(path)
		})
	}).before('handler')
}

export default RouteDirective
