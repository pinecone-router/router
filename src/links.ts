import { type PineconeRouter } from './router'

/**
 * @description Add a handler to click events on valid links
 */
export const handleClicks = (Router: PineconeRouter) => {
	window.document.body.addEventListener('click', (e: MouseEvent) => {
		// Ignore modified clicks or non-primary buttons
		if (
			e.ctrlKey ||
			e.metaKey ||
			e.altKey ||
			e.shiftKey ||
			e.button ||
			e.defaultPrevented
		) {
			return
		}

		// Find closest anchor element
		const node = (e.target as HTMLElement).closest('a')
		if (!node) return

		// Skip if link shouldn't be intercepted
		if (
			(Router.settings.handleClicks === false &&
				!node.hasAttribute('x-link')) ||
			node.hasAttribute('data-native') ||
			node.hasAttribute('native')
		) {
			return
		}

		const href = node.getAttribute('href')
		const target = node.getAttribute('target')

		// Only handle internal links without special targets
		if (
			href &&
			href.startsWith(Router.settings.basePath) &&
			(!target || /^_?self$/i.test(target))
		) {
			Router.navigate(href)
			e.preventDefault()
		}
	})
}
