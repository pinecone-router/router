// Types from handler.ts
export { Handler, HandlerContext } from './handler'

// Types from context.ts
export { Context } from './context'

// Types from route.ts
export { Route, RouteOptions, MatchResult } from './route'

// Types from router.ts
export { PineconeRouter, RoutesMap } from './router'

// Types from history.ts
export { NavigationHistory } from './history'

// Types from settings.ts
export { Settings } from './settings'

// Types from templates.ts
// No explicit interfaces to export

// Types from links.ts
// No explicit interfaces to export

// Types from errors.ts
// Error messages and assertions only, no types to export

// Types from utils.ts
// Utility functions only, no types to export

// Types from directives/x-route.ts
export { RouteTemplate } from './directives/x-route'

// Types from directives/x-handler.ts
// No additional types to export

// Types from directives/x-template.ts
// No additional types to export

export { PineconeRouterPlugin, PineconeRouterPlugin as default } from './index'
