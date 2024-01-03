import Route from './route'
import type { Settings, Context, Middleware, Handler } from './types'
import { fetchError, match, middleware, validLink } from './utils'


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
}

export default function (Alpine) {

	const PineconeRouter = Alpine.reactive(<Window["PineconeRouter"]>{
		version: '4.0.3',
		name: 'pinecone-router',

		settings: <Settings>{
			hash: false,
			basePath: '/',
			templateTargetId: null
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
			redirect(path) {
				navigate(path)
				return 'stop'
			},
			navigate(path) {
				navigate(path)
			}
		},

		/**
		 * Add a new route
		 */
		add(path: string, options?: {}) {
			// check if the route was registered on the same router.
			if (this.routes.find((r: Route) => r.path == path) != null) {
				throw new Error('Pinecone Router: route already exist')
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

	const loadTemplate = (el: HTMLElement, url: string, target: string | null): Promise<string> => {
		if (loadingTemplates[url]) {
			loadingTemplates[url].then(html => {
				if (target == null) {
					el.innerHTML = html
				}
			})
		} else {
			loadingTemplates[url] = fetch(url).then(r => {
				if (r.ok) return r.text()
				throw new Error(String(r.status))
			}).then(html => {
				cachedTemplates[url] = html
				if (target == null) {
					el.innerHTML = html
				}
				return html
			}).catch(err => {
				fetchError(err)
				// returning a value is a must because we are assigning returned value to loadingTemplates[url]
				// by returning a null it will refetch again when the route is (re)visited
				return null
			})
		}
		return loadingTemplates[url]
	}

	const addIf = (el: HTMLElement, routeIndex, path) => {
		// this make sure inline templates dont render until handlers are done
		let route_expression = (routeIndex != null) ? `PineconeRouter.routes[${routeIndex}]` : 'PineconeRouter.notfound'
		let expression = `$router.route == "${path}" && ${route_expression}.handlersDone`
		if (el.hasAttribute("x-if")) return
		el.setAttribute("x-if", expression)
		endLoading()
	}

	const removeIf = (el: HTMLElement) => {
		if (!el.hasAttribute("x-if")) return
		el.removeAttribute("x-if")
	}

	const insertHtmlInTarget = (targetEl: HTMLElement, url: string) => {
		endLoading()
		targetEl.innerHTML = cachedTemplates[url]
	}

	const startLoading = () => {
		document.dispatchEvent(PineconeRouter.loadStart)
	}

	const endLoading = () => {
		document.dispatchEvent(PineconeRouter.loadEnd)
	}

	const addBasePath = (path) => {
		if (!PineconeRouter.settings.hash && PineconeRouter.settings.basePath != '/') {
			return PineconeRouter.settings.basePath + path
		} return path
	}

	const findRouteIndex = (path) => {
		return PineconeRouter.routes.findIndex(
			(r) => r.path == path
		)
	}

	Alpine.directive(
		'route',
		(el: HTMLTemplateElement, { expression }, { cleanup }) => {
			let path = expression

			middleware('onBeforeRouteProcessed', el, path)

			if (path.indexOf('#') > -1) {
				throw new Error(
					`Pinecone Router: A route's path may not have a hash character.`
				)
			}


			let routeIndex = null

			if (path != 'notfound') {
				// if specified add the basePath
				path = addBasePath(path)
				// register the new route if possible
				routeIndex = PineconeRouter.add(path)
			}

			// add if statement for inline template
			if (el.content.firstElementChild != null) {
				let route = PineconeRouter.routes[routeIndex] ?? PineconeRouter.notfound
				addIf(el, routeIndex, path)
			}

			middleware('onAfterRouteProcessed', el, path)

			cleanup(() => {
				PineconeRouter.remove(path)
				removeIf(el)
			})

		}
	)

	Alpine.directive(
		'handler',
		(
			el,
			{ expression },
			{ evaluate, cleanup }
		) => {
			if (!el.hasAttribute('x-route')) {
				throw new Error(
					`Pinecone Router: x-handler must be set on the same element as x-route.`
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
			let path = el.getAttribute('x-route')

			if (typeof evaluatedExpression == 'object')
				handlers = evaluatedExpression
			else {
				throw new Error(
					`Pinecone Router: Invalid handler type: ${typeof evaluatedExpression}.`
				)
			}

			// add `this` context for handlers inside an Alpine.component
			for (let index = 0; index < handlers.length; index++) {
				handlers[index] = handlers[index].bind(Alpine.$data(el))
			}

			let route

			if (path == 'notfound')
				route = PineconeRouter.notfound
			else {
				// if specified add the basePath
				path = addBasePath(path)
				// add handlers to the route
				let i = findRouteIndex(path)
				route = PineconeRouter.routes[i]
			}
			route.handlers = handlers

			cleanup(() => {
				route.handlers = []
				route.handlersDone = true
			})
		}
	)

	Alpine.directive(
		'template',
		(el: HTMLTemplateElement, { modifiers, expression }, { Alpine, effect, cleanup }) => {

			if (!el.hasAttribute("x-route")) throw new Error("Pinecone Router: x-template must be used on the same element as x-route.")

			var isPreloading: any
			let url: string = expression

			let target = modifierValue(modifiers, 'target', null) ?? window.PineconeRouter.settings.templateTargetId
			let targetEl = document.getElementById(target)

			if (target && !targetEl)
				throw new Error("Pinecone Router: Can't find an element with the suplied x-template target ID (" + target + ")")

			if (modifiers.includes("preload")) {
				isPreloading = loadTemplate(el, url, target).finally(() => {
					isPreloading = false
					// In case of failed fetch the template wont be cached
					// therefore we check for it and not add anything if it's null
					if (cachedTemplates[url] == null) return
					if (!target) addIf(el, routeIndex, path);
				})
			}

			let path = el.getAttribute("x-route")
			let route;
			let routeIndex
			if (path == 'notfound') {
				PineconeRouter.notfound.template = url
				route = PineconeRouter.notfound
			}
			else {
				path = addBasePath(path)
				routeIndex = findRouteIndex(path)
				PineconeRouter.routes[routeIndex].template = url
				route = PineconeRouter.routes[routeIndex]
			}


			Alpine.nextTick(() => {
				effect(() => {
					if (route.handlersDone && PineconeRouter.context.route == path) {
						if (cachedTemplates[url] != null) {
							if (!target) {
								endLoading()
								if (el.content.firstElementChild) return
								el.innerHTML = cachedTemplates[url]
							}
							else insertHtmlInTarget(targetEl, url)
						} else {
							if (!isPreloading) {
								loadTemplate(el, url, target).finally(() => {
									if (cachedTemplates[url] == null) return
									if (!target) addIf(el, routeIndex, path)
									else insertHtmlInTarget(targetEl, url)
								})
							} else {
								isPreloading.finally(() => {
									if (cachedTemplates[url] == null) return
									if (target) {
										insertHtmlInTarget(targetEl, url)
									}
								})
							}
						}
					}
				})

			})

			cleanup(() => {
				delete cachedTemplates[route.template]
				route.template = ''
				removeIf(el)
			})
		}
	)

	Alpine.$router = PineconeRouter.context
	Alpine.magic('router', () => PineconeRouter.context)

	document.addEventListener('alpine:initialized', () => {
		middleware('init')
		// virtually navigate the path on the first page load
		// this will register the path in history and sets the pathvariable
		// navigate(window.location.pathname, false, true)
		if (!PineconeRouter.settings.hash) {
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
		window.document.body.addEventListener(
			document.ontouchstart ? 'touchstart' : 'click',
			function (e) {
				if (
					e.metaKey ||
					e.ctrlKey ||
					e.shiftKey ||
					e.defaultPrevented
				) {
					return
				}

				// ensure link
				// use shadow dom when available if not, fall back to composedPath()
				// for browsers that only have shady
				let el = e.target

				let eventPath: any = e.composedPath()
				if (eventPath) {
					for (let i = 0; i < eventPath.length; i++) {
						if (!eventPath[i].nodeName) continue
						if (eventPath[i].nodeName.toUpperCase() !== 'A') continue
						if (!eventPath[i].href) continue

						el = eventPath[i]
						break
					}
				}
				if (el == null) return
				// allow skipping link
				// @ts-ignore
				if (el.hasAttribute('native')) return

				let ret = validLink(el, PineconeRouter.settings.hash)

				if (!ret.valid) {
					return
				}

				let route = PineconeRouter.routes[findRouteIndex(PineconeRouter.context.route)] ?? PineconeRouter.notfound

				// stop handlers in progress before navigating to the next page
				if (!route.handlersDone) {
					route.cancelHandlers = true
					endLoading()
				}

				// prevent default behavior.
				if (e.stopImmediatePropagation) e.stopImmediatePropagation()
				if (e.stopPropagation) e.stopPropagation()
				e.preventDefault()
				navigate(ret.link)
			}
		)
	}

	/**
	 *  Go to the specified path without reloading
	 * @param {string} path the path with no hash even if using hash routing
	 * @param {boolean} fromPopState this will be set to true if called from window.onpopstate event
	 * @param {boolean} firstLoad this will be set to true if this is the first page loaded, also from page reload
	 */
	async function navigate(path, fromPopState = false, firstLoad = false) {
		if (!path) path = '/'
		PineconeRouter.context.path = path

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

		const route: Route = PineconeRouter.routes.find(
			(route: Route) => {
				let m = match(path, route.path)
				route.params = m != false ? m : {}
				return m != false
			}
		) ?? PineconeRouter.notfound

		// if the route has handlres, it will mark them unhandled
		// this is so templates wont render till then.
		route.handlersDone = !route.handlers.length

		if (route.handlers.length || route.template) {
			startLoading()
		}

		let context = buildContext(route.path, path, route.params)

		PineconeRouter.context = context

		// the middleware may return 'stop' to stop execution of this function
		if (
			middleware('onBeforeHandlersExecuted', route, path, firstLoad) == 'stop'
		) {
			endLoading()
			return
		}


		// do not call pushstate from popstate event https://stackoverflow.com/a/50830905
		if (!fromPopState) {
			let fullPath = ''
			if (PineconeRouter.settings.hash) {
				fullPath = '#'
				fullPath += window.location.search + path
			} else {
				fullPath = path + window.location.search + window.location.hash
			}
			// don't create duplicate history entry on first page load
			if (!firstLoad) history.pushState({ path: fullPath }, '', fullPath)
			else {
				if (PineconeRouter.settings.hash) {
					if (path == '/') {
						PineconeRouter.context = context
						return navigate('/', false, false)
					}
				}
			}
		}

		if (
			(route && route.handlers.length)
		) {
			route.cancelHandlers = false
			let ok = await handle(route.handlers, context)
			if (!ok) {
				endLoading()
				return
			}
			route.handlersDone = true
			if (!route.template) endLoading()
		}


		middleware('onHandlersExecuted', route, path, firstLoad)
	}

	function buildContext(route: string, path: string, params: {}): Context {
		return {
			route: route,
			path: path,
			params: params,
			query: window.location.search.substring(1), // query w/out leading '?'
			hash: window.location.hash.substring(1), // hash without leading '#'
			redirect(path) {
				navigate(path)
				return 'stop'
			},
			navigate(path) {
				navigate(path)
			}
		}
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
				let route = PineconeRouter.routes[findRouteIndex(context.route)] ?? PineconeRouter.notfound
				if (route.cancelHandlers) {
					route.cancelHandlers = false
					return false
				}
				let result
				if (handlers[i].constructor.name === 'AsyncFunction')
					result = await handlers[i](context)
				else
					result = handlers[i](context)
				// if the handler redirected, return
				if (result == 'stop') return false
			}
		}
		return true
	}
}

