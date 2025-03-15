import Route from './route';
import type { Settings, Context, Middleware } from './types';
declare global {
    interface Window {
        PineconeRouter: {
            version: string;
            name: string;
            settings: Settings;
            notfound: Route;
            routes: Route[];
            context: Context;
            loadStart: Event;
            loadEnd: Event;
            add: (path: string, options?: {}) => number;
            remove: (path: string) => void;
        };
        PineconeRouterMiddlewares: Array<Middleware>;
    }
    interface HTMLTemplateElement {
        _x_PineconeRouter_undoTemplate: Function;
        _x_PineconeRouter_CurrentTemplate: Element;
        _x_PineconeRouter_CurrentTemplateUrls: string[];
        _x_PineconeRouter_route: string;
        _x_PineconeRouter_CurrentTemplateScript: HTMLScriptElement;
    }
}
declare module 'alpinejs' {
    interface Alpine {
        $router: Context;
    }
    interface Magics<T> {
        $router: Context;
    }
}
export default function (Alpine: any): void;
//# sourceMappingURL=index.d.ts.map