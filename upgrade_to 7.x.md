# Upgrade Guide: Pinecone Router 6.x to 7.x

For a more detailed list of changes and also additions which aren't covered
here, see [CHANGELOG](./CHANGELOG.md#7.0.0)

## $router Changes

- `$router` now provides the [PineconeRouter](./README.md#pineconerouter-object)
  object instead of the [Context object](./README.md#context-object)
  - Use `$router.context` to access the context. See the above links for
    the appropriate types.
- Use new `$params` magic helper instead of `$router.params`
- Replace `$router.route` with `$router.context.route`
- Replace `redirect()` method:
  - `$router.redirect()` → `$router.navigate()`
- Removed `Context.query` and `Context.hash`, access them directly with
  `window.location.search`/`window.location.hash`

## Navigation Stack -> Navigation History

See docs: [Navigation History](./README.md#navigation-history)

- Use new `$history` magic helper for history navigation
  - `$history.back()` \ `$history.canGoBack()`
  - `$history.forward()` \ `$history.canGoForward()`
- Use `PineconeRouter.history` to access from JS.

## Handler Changes

See docs: [x-handler](./README.md#x-handler)

- Replace `context.redirect()` with `this.$router.navigate()`
- Handlers must use provided context parameter - global context
  (ie. $router.context) isn't updated until handlers finish.
- `context.navigate`, `context.redirect` and other functions were all removed
  from the [Context object](./README.md#context-object).
  - Use instead `this.$router.navigate()` inside handlers to redirect.
- Handlers now receive a second argument [`AbortController`](./README.md#handler-arguments).

## Template Changes

See docs: [x-template](./README.md#x-template)

- Must add an empty `x-template` directive for [inline templates](./README.md#inline-templates)
- Templates now support multiple root elements and multiple scripts

## Event Renames

- Update event listeners:
  - `pinecone-start` → `pinecone:start`
  - `pinecone-end` → `pinecone:end`
  - `fetch-error` → `pinecone:fetch-error`

## Settings

See docs: [Settings](./README.md#settings)

PineconeRouter.Settings is now a function.

To configure:

```js
Pinecone.Router.settings({
	basePath: '/app',
	targetID: 'app',
})
```

To read:

```js
PineconeRouter.settings().basePath
```

### Renames

- `Settings.templateTargetId` → `Settings.targetID`
- `Settings.interceptLinks` → `Settings.handleClicks`

### Removed

- `Settings.alwaysSendLoadingEvents` was removed, it is now default behavior.
