import { type ElementWithXAttributes, type Alpine } from 'alpinejs'

import { type Context } from './context'
import { addBasePath } from './utils'
import { settings } from './settings'

const inMakeProgress = new Set()
const cache = new Map<string, string>()
const loading = new Map<string, Promise<string>>()
const preloads = new Set<{ urls: string[]; el?: HTMLElement }>()

export const fetchError = (error: string, url: string) => {
	document.dispatchEvent(
		new CustomEvent('pinecone:fetch-error', { detail: { error, url } })
	)
}

/**
 * Creates a unique instance of a template with the given expression and target
 * element.
 * @param Alpine Alpine.js instance
 * @param template The template element to be processed.
 * @param expression The expression on the x-template directive.
 * @param targetEl The target element where the template will be rendered.
 * @param urls Template urls
 * @returns void
 */
export const make = (
	Alpine: Alpine,
	template: ElementWithXAttributes<HTMLTemplateElement>,
	expression: string, // the expression on the x-template directive
	targetEl?: HTMLElement, // the target element where the template will
	//  be rendered
	urls?: string[] // template urls
) => {
	// having a unique id ensures the same template can be used multiple times
	// inside the same page.
	// this is for when routes share a template.
	// with this, adding an id to the template element will make it unique.
	const unique_id = template.id + expression

	if (inMakeProgress.has(unique_id)) return
	inMakeProgress.add(unique_id)

	const contentNode = template.content

	// pre-allocates the array with the children size
	const clones: HTMLElement[] = Array(contentNode.childElementCount)

	// clone scripts to make them run
	contentNode.querySelectorAll('script').forEach((oldScript) => {
		const newScript = document.createElement('script')
		Array.from(oldScript.attributes).forEach((attr) =>
			newScript.setAttribute(attr.name, attr.value)
		)
		newScript.textContent = oldScript.textContent
		oldScript.parentNode?.replaceChild(newScript, oldScript)
	})

	// clone all children and add the x-data scope
	const children = Array.from(contentNode.children)
	for (let i = 0; i < children.length; i++) {
		clones[i] = children[i].cloneNode(
			true
		) as ElementWithXAttributes<HTMLElement>

		Alpine.addScopeToNode(clones[i], {}, template)
	}

	Alpine.mutateDom(() => {
		if (targetEl) {
			targetEl.replaceChildren(...clones)
		} else template.after(...clones)
		clones.forEach((clone) => {
			Alpine.initTree(clone)
		})
	})

	template._x_PineconeRouter_template = clones
	// keep track of the currently rendered template urls
	template._x_PineconeRouter_templateUrls = urls
	template._x_PineconeRouter_undoTemplate = () => {
		// remove clone elements safely
		Alpine.mutateDom(() => {
			clones.forEach((clone: ElementWithXAttributes<HTMLElement>) => {
				Alpine.destroyTree(clone)
				clone.remove()
			})
		})
		delete template._x_PineconeRouter_template
	}

	Alpine.nextTick(() => inMakeProgress.delete(unique_id))
}

// Hide content of a template element
export const hide = (template: ElementWithXAttributes<HTMLTemplateElement>) => {
	if (template._x_PineconeRouter_undoTemplate) {
		template._x_PineconeRouter_undoTemplate()
		delete template._x_PineconeRouter_undoTemplate
	}
}

export const show = async (
	Alpine: Alpine,
	template: ElementWithXAttributes<HTMLTemplateElement>,
	expression: string,
	urls?: Array<string>,
	targetEl?: HTMLElement
) => {
	// case: template already rendered, params changed.
	// if the template is rendered but the template url parameters have changed
	// hide the content and remove the content inside the template
	// this will trigger the template to be loaded again with new urls bellow.

	if (
		template._x_PineconeRouter_templateUrls != undefined &&
		template._x_PineconeRouter_templateUrls != urls
	) {
		hide(template)
		template.innerHTML = ''
	}

	// case: template already rendered, route didn't change.
	// the template is already inserted into the page
	// leave it as is and return.
	if (template._x_PineconeRouter_template) {
		return
	}

	// case: template not rendered, but template content exists.
	if (template.content.childElementCount) {
		make(Alpine, template, expression, targetEl, urls)
		return
	}

	// case: template content doesn't exist, load it from urls
	if (urls) {
		// if templates are not loaded, load them
		return load(urls, template).then(() =>
			make(Alpine, template, expression, targetEl, urls)
		)
	}
}

/**
 * Interpolates params in URLs.
 * @param urls Array of template URLs.
 * @param params Object containing params to inject into URLs.
 * @returns Array of interpolated URLs.
 */
export const interpolate = (
	urls: string[],
	params: Context['params']
): string[] => {
	return urls.map((url) =>
		url.replace(/:([^/.]+)/g, (_, name) => params[name] || name)
	)
}

/**
 * Load a template from a url and cache its content.
 * @param url Template URL.
 * @param priority Request priority ('high' | 'low'), default: 'high'.
 * @returns {Promise<string>} A promise that resolves to the content of
 * the template as a string.
 */
export const loadUrl = async (
	url: string,
	priority: RequestPriority = 'high'
): Promise<string> => {
	url = addBasePath(url)
	// Return from cache if available
	if (cache.has(url)) return cache.get(url)!

	// Return existing promise if already loading
	if (loading.has(url)) return loading.get(url)!

	const fetchPromise = fetch(url, { ...settings.fetchOptions, priority })
		.then((r) => {
			if (!r.ok) {
				fetchError(r.statusText, url)
				return ''
			}
			return r.text()
		})
		.then((html) => {
			if (html) cache.set(url, html)
			loading.delete(url)
			return html || ''
		})
		.catch((error) => {
			if (error instanceof TypeError) {
				fetchError(error.message, url)
			}
			return ''
		})

	loading.set(url, fetchPromise)
	return fetchPromise
}

/**
 * Add urls to the preload queue
 * @param urls Array of template URLs to preload
 * @param el Optional target element where to put the content of the urls
 * @returns void
 */
export const preload = (urls: string[], el?: HTMLElement): void => {
	preloads.add({ urls, el })
}

/**
 * Load all preloaded templates and removes them from the queue.
 * It is called when the router is initialized and the first page
 * finishes loading.
 * @returns void
 */
export const runPreloads = (): void => {
	for (const item of preloads) {
		if (item.el) {
			load(item.urls, item.el, 'low')
		} else {
			item.urls.map((url: string) => loadUrl(url, 'low'))
		}
		preloads.delete(item)
	}
}

/**
 * Load templates from urls and puts the content the el.innerHTML.
 * @param urls array of urls to load.
 * @param el target element where to put the content of the urls.
 * @param priority Request priority ('high' | 'low'), default: 'high'.
 * @returns {Promise<void>}
 */
export const load = (
	urls: string[],
	el: HTMLTemplateElement | HTMLElement,
	priority: RequestPriority = 'high'
): Promise<void> =>
	Promise.all(urls.map((url) => loadUrl(url, priority))).then((htmlArray) => {
		el.innerHTML = htmlArray.join('')
	})
