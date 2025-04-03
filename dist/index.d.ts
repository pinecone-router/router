import { type PluginCallback } from 'alpinejs';
import { type PineconeRouter } from './router';
import { type NavigationHistory } from './history';
import { type Context } from './context';
declare global {
    interface Window {
        PineconeRouter: PineconeRouter;
    }
}
declare module 'alpinejs' {
    interface XAttributes {
        _x_PineconeRouter_templateUrls: string[];
        _x_PineconeRouter_template: HTMLElement[];
        _x_PineconeRouter_scripts: HTMLScriptElement[];
        _x_PineconeRouter_undoTemplate: () => void;
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
export declare const PineconeRouterPlugin: PluginCallback;
export default PineconeRouterPlugin;
//# sourceMappingURL=index.d.ts.map