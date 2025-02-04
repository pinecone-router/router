import Route from './route'
import type { Settings, Context, Middleware, Handler } from './types'
import { fetchError, match, middleware } from './utils'

declare global {
	interface Window {
		PineconeRouter: {
			version: string
			name: string
			settings: Settings
			notfound: Route
			routes: Route[]
			context: Context
			loadStart: Event
			loadEnd: Event
			add: (path: string, options?: {}) => number
			remove: (path: string) => void
		}
		PineconeRouterMiddlewares: Array<Middleware>
	}
	interface HTMLTemplateElement {
		_x_PineconeRouter_undoTemplate: Function
		_x_PineconeRouter_CurrentTemplate: Element
		_x_PineconeRouter_route: string
	}
}

export default function (Alpine) {
	const PineconeRouter = Alpine.reactive(<Window['PineconeRouter']>{
		version: '5.3.0',
		name: 'pinecone-router',

		settings: <Settings>{
			hash: false,
			basePath: '/',
			templateTargetId: null,
			interceptLinks: true,
			includeQuery: true,
		},

		/**
		 * @description The handler for 404 pages, can be overwritten by a notfound route
		 */
		notfound: new Route('notfound'),

		/**
		 * @type Route[]
		 * @summary array of routes instantiated from the Route class.
		 */
		routes: <Route[]>[],

		/**
		 * @type {Context}
		 * @summary The context object for current path.
		 */
		context: <Context>{
			route: '',
			path: '',
			params: {},
			query: window.location.search.substring(1),
			hash: window.location.hash.substring(1),
			navigationStack: [],
			navigationIndex: 0,
			redirect(path, includeQuery = true) {
				this.navigate(path, includeQuery)
				return 'stop'
			},
			navigate(path, includeQuery = true) {
				navigate(path, false, false, null, includeQuery)
			},
			canGoBack() {
				return this.navigationIndex > 0
			},
			back(includeQuery = true) {
				navigate(
					this.navigationStack[this.navigationIndex - 1],
					false,
					false,
					this.navigationIndex - 1,
					includeQuery,
				)
			},
			canGoForward() {
				return this.navigationIndex < this.navigationStack.length - 1
			},
			forward(includeQuery = true) {
				navigate(
					this.navigationStack[this.navigationIndex + 1],
					false,
					false,
					this.navigationIndex + 1,
					includeQuery,
				)
			},
		},

		/**
		 * Add a new route
		 */
		add(path: string, options?: { [key: string]: any }) {
			// check if the route was registered on the same router.
			if (this.routes.find((r: Route) => r.path == path) != null) {
				throw new Error('Pinecone Router: route already exist')
			}
			if (options?.templates && options?.preload) {
				loadAll(null, options.templates, true)
			}
			return this.routes.push(new Route(path, options)) - 1
		},
		/**
		 * Remove a route
		 */
		remove(path: string) {
			this.routes = this.routes.filter((r: Route) => r.path != path)
		},
		/**
		 * @event pinecone-start
		 * @summary be dispatched to the window after before page start loading.
		 */
		loadStart: new Event('pinecone-start'),

		/**
		 * @event pinecone-end
		 * @summary will be dispatched to the window after the views are fetched
		 */
		loadEnd: new Event('pinecone-end'),
	})

	window.PineconeRouter = PineconeRouter

	var loadingTemplates: { [key: string]: Promise<string> } = {}
	var cachedTemplates: { [key: string]: string } = {}
	const inMakeProgress = new Set()

	const make = (
		el: HTMLTemplateElement,
		expression: string,
		targetEl?: HTMLElement,
	) => {
		if (inMakeProgress.has(expression)) return
		inMakeProgress.add(expression)

		const clone = (el.content.cloneNode(true) as HTMLElement)
			.firstElementChild

		if (!clone) return

		Alpine.addScopeToNode(clone, {}, el)

		Alpine.mutateDom(() => {
			if (targetEl != null) {
				targetEl.replaceChildren(clone)
			} else el.after(clone)
			Alpine.initTree(clone)
		})

		el._x_PineconeRouter_CurrentTemplate = clone

		el._x_PineconeRouter_undoTemplate = () => {
			clone.remove()

			delete el._x_PineconeRouter_CurrentTemplate
		}

		Alpine.nextTick(() => inMakeProgress.delete(expression))
	}

	function hide(el: HTMLTemplateElement) {
		if (el._x_PineconeRouter_undoTemplate) {
			el._x_PineconeRouter_undoTemplate()
			delete el._x_PineconeRouter_undoTemplate
		}
	}

	function showAll(
		el: HTMLTemplateElement,
		expression: string,
		urls?: Array<string>,
		targetEl?: HTMLElement,
	) {
		if (el._x_PineconeRouter_CurrentTemplate)
			return el._x_PineconeRouter_CurrentTemplate
		if (el.content.firstElementChild) {
			make(el, expression, targetEl)
			endLoading()
		} else if (urls) {
			// Since during loading, the content is automatically put inside the template
			// This first case will only happen if the content of the template was cleared somehow
			// Likely manually
			if (urls.every((url) => cachedTemplates[url])) {
				if (urls.length > 1) el.innerHTML = '<templates-wrapper>'
				urls.forEach((url) => {
					el.innerHTML += cachedTemplates[url]
				})
				if (urls.length > 1) el.innerHTML = '</templates-wrapper>'
				make(el, expression, targetEl)
				endLoading()
			} else {
				// This second case is that it didn't finish loading
				loadAll(el, urls)
					.then(() => make(el, expression, targetEl))
					.finally(() => endLoading())
			}
		}
	}

	const loadAll = (
		el: HTMLTemplateElement | HTMLElement,
		urls: string[],
		programmaticTemplates: boolean = false,
	): Promise<string> => {
		const loadPromises = urls.map((url) => {
			if (loadingTemplates[url]) {
				return loadingTemplates[url]
			} else if (cachedTemplates[url]) {
				// return new promise that returns cachedTemplates[url]:
				return new Promise((resolve) => {
					resolve(cachedTemplates[url])
				}) as Promise<string>
				// return cachedTemplates[url]
			} else {
				loadingTemplates[url] = fetch(url)
					.then((r) => {
						if (!r.ok) {
							fetchError(r.statusText)
							return null
						}
						return r.text()
					})
					.then((html) => {
						if (html == null) {
							cachedTemplates[url] = null
							loadingTemplates[url] = null
							return null
						}
						cachedTemplates[url] = html
						loadingTemplates[url] = null
						return html
					})
				return loadingTemplates[url]
			}
		})

		return Promise.all(loadPromises).then((htmlArray) => {
			// if el was not passed, means it was just preloading programmatic templates
			const combinedHtml = htmlArray
				.filter((html) => html !== null)
				.join('')
			if (!el) return combinedHtml
			// don't add the wrapper on programmatically added templates
			// since it doesn't use the <template> method it is not needed
			if (urls.length > 1 && !programmaticTemplates)
				el.innerHTML =
					'<templates-wrapper>' +
					combinedHtml +
					'</templates-wrapper>'
			else el.innerHTML = combinedHtml
			return el.innerHTML
		})
	}

	const startLoading = () => {
		document.dispatchEvent(PineconeRouter.loadStart)
	}

	const endLoading = () => {
		document.dispatchEvent(PineconeRouter.loadEnd)
	}

	const addBasePath = (path) => {
		if (
			!PineconeRouter.settings.hash &&
			PineconeRouter.settings.basePath != '/'
		) {
			return PineconeRouter.settings.basePath + path
		}
		return path
	}

	const findRouteIndex = (path) => {
		return PineconeRouter.routes.findIndex((r) => r.path == path)
	}

	Alpine.directive(
		'route',
		(
			el: HTMLTemplateElement,
			{ expression, modifiers },
			{ effect, cleanup },
		) => {
			let path = expression

			middleware('onBeforeRouteProcessed', el, path)

			if (path.indexOf('#') > -1) {
				throw new Error(
					`Pinecone Router: A route's path may not have a hash character.`,
				)
			}

			let target =
				modifierValue(modifiers, 'target', null) ??
				window.PineconeRouter.settings.templateTargetId
			let targetEl = document.getElementById(target)
			if (target && !targetEl)
				throw new Error(
					"Pinecone Router: Can't find an element with the suplied target ID: " +
						target +
						'',
				)

			let routeIndex = null

			if (path != 'notfound') {
				// if specified add the basePath
				path = addBasePath(path)
				// register the new route if possible
				routeIndex = PineconeRouter.add(path)
			}

			let route =
				PineconeRouter.routes[routeIndex] ?? PineconeRouter.notfound

			// set the path in the element so it is used by other directives
			el._x_PineconeRouter_route = path

			if (el.content.firstElementChild != null) {
				Alpine.nextTick(() => {
					effect(() => {
						let found =
							route.handlersDone &&
							PineconeRouter.context.route == path
						found
							? showAll(el, expression, null, targetEl)
							: hide(el)
					})
				})
			}

			cleanup(() => {
				el._x_PineconeRouter_undoTemplate &&
					el._x_PineconeRouter_undoTemplate()
				PineconeRouter.remove(path)
				delete el._x_PineconeRouter_route
			})

			middleware('onAfterRouteProcessed', el, path)
		},
	)

	Alpine.directive('handler', (el, { expression }, { evaluate, cleanup }) => {
		if (!el._x_PineconeRouter_route) {
			throw new Error(
				`Pinecone Router: x-handler must be set on the same element as x-route.`,
			)
		}

		let handlers

		// check if the handlers expression is an array
		// if not make it one
		if (
			!(expression.startsWith('[') && expression.endsWith(']')) &&
			!(expression.startsWith('Array(') && expression.endsWith(')'))
		) {
			expression = `[${expression}]`
		}

		let evaluatedExpression = evaluate(expression)

		if (typeof evaluatedExpression == 'object')
			handlers = evaluatedExpression
		else {
			throw new Error(
				`Pinecone Router: Invalid handler type: ${typeof evaluatedExpression}.`,
			)
		}

		// add `this` context for handlers inside an Alpine.component
		for (let index = 0; index < handlers.length; index++) {
			handlers[index] = handlers[index].bind(Alpine.$data(el))
		}

		// add handlers to the route
		let path = el._x_PineconeRouter_route
		let route =
			path == 'notfound'
				? PineconeRouter.notfound
				: PineconeRouter.routes[findRouteIndex(path)]
		route.handlers = handlers

		cleanup(() => {
			route.handlers = []
			route.handlersDone = true
			route.cancelHandlers = false
		})
	})

	Alpine.directive(
		'template',
		(
			el: HTMLTemplateElement,
			{ modifiers, expression },
			{ Alpine, effect, evaluate, cleanup },
		) => {
			if (!el._x_PineconeRouter_route)
				throw new Error(
					'Pinecone Router: x-template must be used on the same element as x-route.',
				)

			if (el.content.firstElementChild != null)
				throw new Error(
					'Pinecone Router: x-template cannot be used alongside an inline template (template element should not have a child).',
				)

			if (
				!(expression.startsWith('[') && expression.endsWith(']')) &&
				!(expression.startsWith('Array(') && expression.endsWith(')'))
			) {
				expression = `['${expression}']`
			}

			let evaluatedExpression = evaluate(expression)

			let urls: string[]

			if (typeof evaluatedExpression == 'object')
				urls = evaluatedExpression
			else {
				throw new Error(
					`Pinecone Router: Invalid handler type: ${typeof evaluatedExpression}.`,
				)
			}

			let target =
				modifierValue(modifiers, 'target', null) ??
				window.PineconeRouter.settings.templateTargetId
			let targetEl = document.getElementById(target)

			if (target && !targetEl)
				throw new Error(
					"Pinecone Router: Can't find an element with the suplied target ID: " +
						target +
						'',
				)

			if (modifiers.includes('preload')) {
				loadAll(el, urls, false)
			}

			// add template to the route
			let path = el._x_PineconeRouter_route
			let route =
				path == 'notfound'
					? PineconeRouter.notfound
					: PineconeRouter.routes[findRouteIndex(path)]
			route.templates = urls

			Alpine.nextTick(() => {
				effect(() => {
					let found =
						route.handlersDone &&
						PineconeRouter.context.route == route.path
					found ? showAll(el, expression, urls, targetEl) : hide(el)
				})
			})

			cleanup(() => {
				el._x_PineconeRouter_undoTemplate &&
					el._x_PineconeRouter_undoTemplate()
			})
		},
	)

	Alpine.$router = PineconeRouter.context
	Alpine.magic('router', () => PineconeRouter.context)

	document.addEventListener('alpine:initialized', () => {
		middleware('init')
		// virtually navigate the path on the first page load
		// this will register the path in history and sets the pathvariable
		// navigate(window.location.pathname, false, true)
		if (PineconeRouter.settings.hash == false) {
			// navigate to the current page to handle it
			// ONLY if we not using hash routing for the default router
			navigate(location.pathname, false, true)
		} else {
			navigate(location.hash.substring(1), false, true)
		}
	})

	// handle navigation events not emitted by links, for example, back button.
	window.addEventListener('popstate', () => {
		if (PineconeRouter.settings.hash) {
			if (window.location.hash != '') {
				navigate(window.location.hash.substring(1), true)
			}
		} else {
			navigate(window.location.pathname, true)
		}
	})

	// intercept click event in links
	interceptLinks()

	/**
	 * @description Add a handler to click events on all valid links
	 */
	function interceptLinks() {
		function validateLink(node) {
			// only valid elements
			if (!node || !node.getAttribute) return

			let href = node.getAttribute('href'),
				target = node.getAttribute('target')

			// ignore links with targets and non-path URLs
			if (
				!href ||
				!href.match(/^\//g) ||
				(target && !target.match(/^_?self$/i))
			)
				return

			if (typeof href !== 'string' && href.url) {
				href = href.url
			}
			return href
		}
		window.document.body.addEventListener('click', function (e: any) {
			if (
				e.ctrlKey ||
				e.metaKey ||
				e.altKey ||
				e.shiftKey ||
				e.button ||
				e.defaultPrevented
			)
				return

			let currentRoute =
				PineconeRouter.routes[
					findRouteIndex(PineconeRouter.context.route)
				] ?? PineconeRouter.notfound

			// stop handlers in progress before navigating to the next page
			if (!currentRoute.handlersDone) {
				currentRoute.cancelHandlers = true
				endLoading()
			}

			let node = e.target

			do {
				if (node.localName === 'a' && node.getAttribute('href')) {
					if (
						window.PineconeRouter.settings.interceptLinks ==
							false &&
						!node.hasAttribute('x-link')
					)
						return
					if (
						node.hasAttribute('data-native') ||
						node.hasAttribute('native')
					)
						return
					let href = validateLink(node)
					if (href) {
						navigate(href)
						if (e.stopImmediatePropagation)
							e.stopImmediatePropagation()
						if (e.stopPropagation) e.stopPropagation()
						e.preventDefault()
					}
					break
				}
			} while ((node = node.parentNode))
		})
	}

	/**
	 *  Go to the specified path without reloading
	 * @param {string} path the path with no hash even if using hash routing
	 * @param {boolean} fromPopState this will be set to true if called from window.onpopstate event
	 * @param {boolean} firstLoad this will be set to true if this is the first page loaded, also from page reload
	 */
	async function navigate(
		path,
		fromPopState = false,
		firstLoad = false,
		navigationIndex = null,
		includeQuery = true,
	) {
		if (!path) path = '/'

		// only add basePath if it was set
		// if not using hash routing
		// and if it wasn't added already
		if (!PineconeRouter.settings.hash) {
			if (
				PineconeRouter.settings.basePath != '/' &&
				!path.startsWith(PineconeRouter.settings.basePath)
			) {
				path = PineconeRouter.settings.basePath + path
			}
			if (
				path == PineconeRouter.settings.basePath &&
				!path.endsWith('/')
			) {
				path += '/'
			}
		}

		// if called from $router.back() or .front(), do not add the path to the stack
		// but change the index accordingly
		if (navigationIndex != null) {
			PineconeRouter.context.navigationIndex = navigationIndex
		} else if (path != PineconeRouter.context.path) {
			// the above check makes sure soft-reloading doesnt add to the stack duplicate entries

			// if navigated after using back(), remove all the elements of the stack from the current index to the end
			// then add the current path at the end of the tack
			if (
				PineconeRouter.context.navigationIndex !==
				PineconeRouter.context.navigationStack.length - 1
			) {
				PineconeRouter.context.navigationStack =
					PineconeRouter.context.navigationStack.slice(
						0,
						PineconeRouter.context.navigationIndex + 1,
					)
				PineconeRouter.context.navigationStack.push(path)
				PineconeRouter.context.navigationIndex =
					PineconeRouter.context.navigationStack.length - 1
			} else {
				// if this is a regular navigation request, add the path to the stack
				PineconeRouter.context.navigationStack.push(path)
				PineconeRouter.context.navigationIndex =
					PineconeRouter.context.navigationStack.length - 1
			}
		}

		const route: Route =
			PineconeRouter.routes.find((route: Route) => {
				let m = match(path, route.path)
				route.params = m != false ? m : {}
				return m != false
			}) ?? PineconeRouter.notfound

		// if the route has handlres, it will mark them unhandled
		// this is so templates wont render till then.
		route.handlersDone = !route.handlers.length

		if (route.handlers.length || route.templates.length) {
			startLoading()
		}

		buildContext(route.path, path, route.params)

		// the middleware may return 'stop' to stop execution of this function
		if (
			middleware('onBeforeHandlersExecuted', route, path, firstLoad) ==
			'stop'
		) {
			endLoading()
			return
		}

		// do not call pushstate from popstate event https://stackoverflow.com/a/50830905
		if (!fromPopState) {
			let fullPath = ''
			if (PineconeRouter.settings.hash) {
				fullPath = '#'
				if (includeQuery && PineconeRouter.settings.includeQuery)
					fullPath += window.location.search
				fullPath += path
			} else {
				fullPath = path
				if (includeQuery && PineconeRouter.settings.includeQuery)
					fullPath += window.location.search
				fullPath += window.location.hash
			}
			// don't create duplicate history entry on first page load
			if (!firstLoad) history.pushState({ path: fullPath }, '', fullPath)
			else {
				if (PineconeRouter.settings.hash) {
					if (path == '/') {
						return navigate('/', false, false)
					}
				}
			}
		}

		if (route && route.handlers.length) {
			route.cancelHandlers = false
			let ok = await handle(route.handlers, PineconeRouter.context)
			if (!ok) {
				endLoading()
				return
			}
			route.handlersDone = true
			if (!route.templates) endLoading()
		}

		// show templates added programmatically
		if (route.templates.length && route.programmaticTemplates) {
			let target = route.templateTargetId
				? document.getElementById(route.templateTargetId)
				: document.getElementById(
						PineconeRouter.settings.templateTargetId,
				  )
			loadAll(target, route.templates, route.programmaticTemplates).then(
				() => {
					endLoading()
				},
			)
		}

		middleware('onHandlersExecuted', route, path, firstLoad)
	}

	function buildContext(route: string, path: string, params: {}) {
		PineconeRouter.context.route = route
		PineconeRouter.context.path = path
		PineconeRouter.context.params = params
		PineconeRouter.context.query = window.location.search.substring(1) // query w/out leading '?'
		PineconeRouter.context.hash = window.location.hash.substring(1) // hash without leading '#'
	}

	function modifierValue(modifiers, key, fallback) {
		// If the modifier isn't present, use the default.
		if (modifiers.indexOf(key) === -1) return fallback

		// If it IS present, grab the value after it
		const rawValue = modifiers[modifiers.indexOf(key) + 1]

		if (!rawValue) return fallback

		if (key === 'target') {
			let match = rawValue.match(/([a-z0-9_-]+)/)
			if (match) return match[1]
		}
		return rawValue
	}
	/**
	 * execute the handlers of routes that are given passing them the context.
	 */
	async function handle(handlers, context) {
		for (let i = 0; i < handlers.length; i++) {
			if (typeof handlers[i] == 'function') {
				// stop if the handlers were canceled for example the user clicked a link
				let route =
					PineconeRouter.routes[findRouteIndex(context.route)] ??
					PineconeRouter.notfound
				if (route.cancelHandlers) {
					route.cancelHandlers = false
					return false
				}
				let result
				if (handlers[i].constructor.name === 'AsyncFunction')
					result = await handlers[i](context)
				else result = handlers[i](context)
				// if the handler redirected, return
				if (result == 'stop') return false
			}
		}
		return true
	}
}
