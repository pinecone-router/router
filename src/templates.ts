import { type ElementWithXAttributes, type Alpine } from 'alpinejs'

import { type Context } from './context'
import { settings } from './settings'
import { addBasePath } from './utils'

const inMakeProgress = new Set()
const cache = new Map<string, string>()
const loading = new Map<string, Promise<string>>()
const preloads = new Set<{ urls: string[]; el?: HTMLElement }>()

export const fetchError = (error: string, url: string) => {
	document.dispatchEvent(
		new CustomEvent('pinecone:fetch-error', { detail: { error, url } })
	)
}

// This function takes a template element and inserts its content right after
// the element, or alternatively if  targetEl is it then inside of the latter.
export const make = (
	Alpine: Alpine,
	template: ElementWithXAttributes<HTMLTemplateElement>,
	expression: string, // the expression on the x-template directive
	targetEl?: HTMLElement,
	urls?: string[]
) => {
	// having a unique id ensures the same template can be used multiple times
	// inside the same page.
	// this is for when routes share a template.
	// with this, adding an id to the template element will make it unique.
	const unique_id = template.id + expression

	if (inMakeProgress.has(unique_id)) return
	inMakeProgress.add(unique_id)

	const contentNode = template.content

	const clones: HTMLElement[] = Array(contentNode.childElementCount)

	// Clone scripts to make them run
	contentNode.querySelectorAll('script').forEach((oldScript) => {
		const newScript = document.createElement('script')
		Array.from(oldScript.attributes).forEach((attr) =>
			newScript.setAttribute(attr.name, attr.value)
		)
		newScript.textContent = oldScript.textContent
		oldScript.parentNode?.replaceChild(newScript, oldScript)
	})

	// Clone all children and add the x-data scope
	Array.from(contentNode.children).forEach((child, index) => {
		const clone = child.cloneNode(true) as ElementWithXAttributes<HTMLElement>
		clones[index] = clone
		Alpine.addScopeToNode(clone, {}, template)
		// TODO: add if proved useful
		// template.id && clone.setAttribute('template-id', template.id)
	})

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
		// Remove clone element
		Alpine.mutateDom(() => {
			clones.forEach((clone: ElementWithXAttributes<HTMLElement>) => {
				Alpine.destroyTree(clone)
				clone.remove()
			})
		})

		delete template._x_PineconeRouter_template
		delete template._x_PineconeRouter_templateUrls
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

// Process params inside template urls
export const interpolate = (
	urls: string[],
	params: Context['params']
): string[] => {
	return urls.map((url) =>
		url.replace(/:([^/.]+)/g, (_, name) => params[name] || name)
	)
}

// Load a template from a url and put its content into cachedTemplates
export const loadUrl = async (
	url: string,
	priority: RequestPriority = 'high'
): Promise<string> => {
	url = addBasePath(url, settings.basePath)
	// Return from cache if available
	if (cache.has(url)) return cache.get(url)!

	// Return existing promise if already loading
	if (loading.has(url)) return loading.get(url)!

	const fetchPromise = fetch(url, { priority })
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

	loading.set(url, fetchPromise)
	return fetchPromise
}

// Preload templates from urls
export const preload = (urls: string[], el?: HTMLElement): void => {
	preloads.add({ urls, el })
}

export const runPreloads = (): void => {
	for (const item of preloads) {
		if (item.el) {
			load(item.urls, item.el, 'low')
		} else {
			item.urls.map((url) => loadUrl(url, 'low'))
		}
		preloads.delete(item)
	}
}

/**
 * Load templates from urls into an element
 * @param urls array of urls to load
 * @param el target element where to put the content of the urls
 * @returns Promise<string> the new innerHTML of the target element
 */
export const load = (
	urls: string[],
	el: HTMLTemplateElement | HTMLElement,
	priority: RequestPriority = 'high'
): Promise<void> =>
	Promise.all(urls.map((url) => loadUrl(url, priority))).then((htmlArray) => {
		el.innerHTML = htmlArray.join('')
	})
