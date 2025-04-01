# Upgrade Guide: Pinecone Router 6.x to 7.x

## Access Pattern Changes

- Use new `$params` magic helper instead of `$router.params`
- Replace `$router.route` with `$router.context.route.path`
- Access URL query and hash directly with `window.location.search`/`window.location.hash`

## Navigation Methods

- Use new `$history` magic helper for history navigation
  - `$router.back()` → `$history.back()` \ `$history.canGoBack()`
  - `$router.forward()` → `$history.forward()` \ `$history.canGoForward()`
- Replace `redirect()` method:
  - `$router.redirect()` → `$router.navigate()`

## Handler Changes

- Handlers now receive a second argument [`AbortController`](./README.md#handler-arguments).
- **Important**: Handlers must use provided context parameter - global context
  (ie. $router.context) isn't updated until handlers finish.
- `context.navigate`, `context.redirect` and other functions were all removed
  from the [Context object](./README.md#context-object).
  - Use instead `this.$router.navigate()` inside handlers to redirect.
- Return data from handlers to pass to subsequent handlers

## Template Updates

- Convert inline templates to use empty `x-template` directive
- Add unique `id` attributes to templates sharing the same URL
- Templates support multiple root elements and multiple scripts

## Event Names

- Update event listeners:
  - `pinecone-start` → `pinecone:start`
  - `pinecone-end` → `pinecone:end`
  - `fetch-error` → `pinecone:fetch-error`

## Setting Renames

- `Settings.templateTargetId` → `Settings.targetID`
- `Settings.alwaysSendLoadingEvents` → `Settings.alwaysLoad`
- `Settings.interceptLinks` → `Settings.handleClicks`
