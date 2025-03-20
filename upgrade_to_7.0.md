# Handlers

## Context Object:

```ts
type Context = {
	route: Route
	params: Record<string, string>
	path: string
	query: string // query without leading '?'
	hash: string // hash without leading '#'
	navigationStack: string[]
	navigationIndex: number
}
```

- `Context.route` is now a [`Route`](#route-object) class instance instead of string
- The methods navigate|redirect|goBack|goForward are no longer part of the context object
  - To call the above functions from a handler use `this.$router.navigate` if inside an Alpine component, or use `window.PineconeRouter.navigate` or `Alpine.$router.navigate`

> This is to keep things where they should be, the context object should not contain any router functions.

# Route object

```ts
class Route {
	params: Record<string, string> = {}
	programmaticTemplates: boolean
	templateTargetId: string = ''
	pattern: RegExp | string
	handlers: Handler[] = []
	templates: string[] = []
	cancelHandlers: boolean
	handlersDone: boolean
	preload: boolean
	path: string
	/**
	 * Check whether a path matches against this route
	 * @param {string} path - path to match against
	 * @returns {boolean} - whether the path matches the route
	 */
	match(path: string): boolean
}
```
