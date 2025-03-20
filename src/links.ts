import { type PineconeRouter } from './router'

/**
 * @description Add a handler to click events on all valid links
 */
export const interceptLinks = (Router: PineconeRouter) => {
	function validateLink(node: HTMLAnchorElement): string | undefined {
		// only valid elements
		if (!node || !node.getAttribute) return

		let href = node.getAttribute('href')!,
			target = node.getAttribute('target')

		// ignore links with targets and non-path URLs
		if (!href || !href.match(/^\//g) || (target && !target.match(/^_?self$/i)))
			return

		return href
	}

	window.document.body.addEventListener('click', function (e: MouseEvent) {
		if (
			e.ctrlKey ||
			e.metaKey ||
			e.altKey ||
			e.shiftKey ||
			e.button ||
			e.defaultPrevented
		)
			return

		// stop handlers in progress before navigating to the next page
		if (Router.context.route && !Router.context.route?.handlersDone) {
			Router.context.route.cancelHandlers = true
			Router.endLoading()
		}

		let node = e.target as HTMLElement

		do {
			if (node instanceof HTMLAnchorElement && node.getAttribute('href')) {
				if (
					Router.settings.interceptLinks == false &&
					!node.hasAttribute('x-link')
				)
					return
				if (node.hasAttribute('data-native') || node.hasAttribute('native'))
					return
				let href = validateLink(node)
				if (href) {
					Router.navigate(href)
					if (e.stopImmediatePropagation) e.stopImmediatePropagation()
					if (e.stopPropagation) e.stopPropagation()
					e.preventDefault()
				}
				break
			}
		} while ((node = node.parentNode as HTMLElement))
	})
}
