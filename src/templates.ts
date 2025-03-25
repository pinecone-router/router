import { type ElementWithXAttributes, type Alpine } from 'alpinejs'

import { type PineconeRouter } from './router'
import { Context } from './context'

const loadingTemplates: Record<string, Promise<string>> = {}
const cachedTemplates: Record<string, string> = {}
const inMakeProgress = new Set()

export const fetchError = (error: string, url: string) => {
	document.dispatchEvent(
		new CustomEvent('pinecone:fetch-error', { detail: { error, url } }),
	)
}

export const make = (
	Alpine: Alpine,
	template: ElementWithXAttributes<HTMLTemplateElement>,
	expression: string, // the expression on the x-template directive
	targetEl?: HTMLElement,
	urls?: string[],
) => {
	// having a unique id ensures the same template can be used multiple times inside the same page
	// this is for when routes share a template
	// with this, adding an id to the template element will make it unique
	const unique_id = template.id + expression

	if (inMakeProgress.has(unique_id)) return
	inMakeProgress.add(unique_id)

	const contentNode = template.content

	const clones: HTMLElement[] = Array(contentNode.childElementCount)

	// Clone scripts to make them run
	contentNode.querySelectorAll('script').forEach((oldScript) => {
		const newScript = document.createElement('script')
		Array.from(oldScript.attributes).forEach((attr) =>
			newScript.setAttribute(attr.name, attr.value),
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
		if (targetEl != undefined) {
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

export const show = (
	Alpine: Alpine,
	Router: PineconeRouter,
	template: ElementWithXAttributes<HTMLTemplateElement>,
	expression: string,
	urls?: Array<string>,
	targetEl?: HTMLElement,
): void => {
	// if the template is rendered but the template url parameters have changed
	// remove the content inside the template
	if (
		template._x_PineconeRouter_templateUrls != undefined &&
		template._x_PineconeRouter_templateUrls != urls
	) {
		hide(template)
		template.innerHTML = ''
	}

	// the template is already inserted into the page
	// leave it as is and end loading
	if (template._x_PineconeRouter_template) {
		Router.endLoading()
		return
	}

	if (template.content.childElementCount) {
		make(Alpine, template, expression, targetEl, urls)
		Router.endLoading()
	} else if (urls) {
		// If templates are not loaded, load them

		load(urls, template)
			.then(() => make(Alpine, template, expression, targetEl, urls))
			.finally(() => Router.endLoading())
	}
}

export const interpolate = (
	urls: string[],
	params: Context['params'],
): string[] => {
	return urls.map((url) => {
		// Replace :param format (e.g., /users/:id/profile.html)
		return url.replace(/:([^/.]+)/g, (_, paramName) => {
			return params[paramName] || paramName
		})
	})
}

// Load a template from a url and put its content into cachedTemplates
const loadUrl = async (url: string): Promise<string> => {
	// if the url is already being loaded, return the promise
	if (loadingTemplates.hasOwnProperty(url)) {
		return loadingTemplates[url]
	} else if (cachedTemplates[url]) {
		return cachedTemplates[url]
	} else {
		// if the url is neither loading nor cached, start loading
		loadingTemplates[url] = fetch(url)
			.then((r) => {
				if (!r.ok) {
					fetchError(r.statusText, url)
					return
				}
				return r.text()
			})
			.then((html) => {
				if (!html) return ''
				cachedTemplates[url] = html
				delete loadingTemplates[url]
				return html
			})
		return loadingTemplates[url]
	}
}

// Preload templates from urls
export const preload = (urls: string[]): void => {
	urls.forEach(loadUrl)
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
): Promise<string> => {
	return Promise.all(urls.map(loadUrl)).then((htmlArray) => {
		el.innerHTML = htmlArray.join('')
		return el.innerHTML
	})
}
