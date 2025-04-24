import { NavigationHistory } from './history';
import { PineconeRouter } from './router';
import { Context } from './context';
declare global {
    interface Window {
        PineconeRouter: PineconeRouter;
    }
}
declare module 'alpinejs' {
    interface XAttributes {
        _x_PineconeRouter_undoTemplate: () => void;
        _x_PineconeRouter_template?: HTMLElement[];
        _x_PineconeRouter_templateUrls?: string[];
        _x_PineconeRouter_route: string;
    }
    interface Magics<T> {
        $router: PineconeRouter;
        $history: NavigationHistory;
        $params: Context['params'];
    }
    interface Alpine {
        $router: PineconeRouter;
    }
}
export { Handler, HandlerContext } from './handler';
export { Context } from './context';
export { Route, RouteOptions, MatchResult } from './route';
export { PineconeRouter, RoutesMap } from './router';
export { NavigationHistory } from './history';
export { Settings } from './settings';
export { RouteTemplate } from './directives/x-route';
export { PineconeRouterPlugin, PineconeRouterPlugin as default } from './index';
//# sourceMappingURL=types.d.ts.map