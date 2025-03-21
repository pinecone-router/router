import { type ElementWithXAttributes, type Alpine } from 'alpinejs'

import { PineconeRouter } from './router'

const loadingTemplates: Record<string, Promise<string>> = {}
const cachedTemplates: Record<string, string> = {}
const inMakeProgress = new Set()

export const fetchError = (error: string, url: string) => {
	document.dispatchEvent(
		new CustomEvent('pinecone-fetch-error', { detail: { error, url } }),
	)
}

export const make = (
	Alpine: Alpine,
	template: ElementWithXAttributes<HTMLTemplateElement>,
	expression: string,
	targetEl?: HTMLElement,
	urls?: string[],
) => {
	const unique_id = (template.id ?? '') + expression

	if (inMakeProgress.has(unique_id)) return
	inMakeProgress.add(unique_id)

	const contentNode = template.content

	if (!contentNode) return

	const clones: HTMLElement[] = []

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
	Array.from(contentNode.children).forEach((child) => {
		const clone = child.cloneNode(true) as ElementWithXAttributes<HTMLElement>
		clones.push(clone)
		Alpine.addScopeToNode(clone, {}, template)
		template.id && clone.setAttribute('template-id', template.id)
	})

	Alpine.mutateDom(() => {
		if (targetEl != undefined) {
			targetEl.replaceChildren(...clones)
		} else template.after(...clones)
		clones.forEach((clone) => {
			Alpine.initTree(clone)
		})
	})

	template._x_PineconeRouter_Template = clones
	template._x_PineconeRouter_TemplateUrls = urls

	template._x_PineconeRouter_undoTemplate = () => {
		// Remove clone element
		template._x_PineconeRouter_Template?.forEach((clone) => clone.remove())
		delete template._x_PineconeRouter_Template
	}

	Alpine.nextTick(() => inMakeProgress.delete(unique_id))
}

// Hide content of a template element
export const hide = (el: ElementWithXAttributes<HTMLTemplateElement>) => {
	if (el._x_PineconeRouter_undoTemplate) {
		el._x_PineconeRouter_undoTemplate()
		delete el._x_PineconeRouter_undoTemplate
	}
}

export const show = (
	Alpine: Alpine,
	Router: PineconeRouter,
	// template element
	template: ElementWithXAttributes<HTMLTemplateElement>,
	expression: string,
	urls?: Array<string>,
	targetEl?: HTMLElement,
	// interpolated?: boolean,
): void => {
	// if the template element has content but the parameters have changed
	// remove the content inside the template
	if (
		template._x_PineconeRouter_TemplateUrls != undefined &&
		template._x_PineconeRouter_TemplateUrls != urls
	) {
		hide(template)
		template.innerHTML = ''
	}

	// the template is already inserted into the page
	if (template._x_PineconeRouter_Template) {
		return
	}

	if (template.content.childElementCount) {
		make(Alpine, template, expression, targetEl, urls)
		if (Router.startEventDispatched) Router.endLoading()
	} else if (urls) {
		// this occurs when the params change in the same route when using interpolated template urls
		if (urls.every((url) => cachedTemplates[url])) {
			template.innerHTML = ''
			urls.forEach((url) => {
				template.innerHTML += cachedTemplates[url]
			})
			make(Alpine, template, expression, targetEl, urls)
			Router.endLoading()
		} else {
			// This second case is that templates didn't finish loading
			load(urls, template)
				.then(() => make(Alpine, template, expression, targetEl, urls))
				.finally(() => Router.endLoading())
		}
	}
}

export const interpolate = (
	urls: string[],
	params: Record<string, string>,
): string[] => {
	return urls.map((url) => {
		// Replace :param format (e.g., /users/:id/profile.html)
		return url.replace(/:([^/.]+)/g, (match, paramName) => {
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
	urls.forEach((url: string) => loadUrl(url))
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
	return Promise.all(urls.map((url) => loadUrl(url))).then((htmlArray) => {
		el.innerHTML = htmlArray.join('')
		return el.innerHTML
	})
}
