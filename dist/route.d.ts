import type { Handler } from './types';
declare class Route {
    params: {
        [key: string]: any;
    };
    path: string;
    handlers: Handler[];
    constructor(path: string, options?: {
        [key: string]: any;
    });
    templates: string[];
    templateTargetId: string;
    programmaticTemplates: boolean;
    handlersDone: boolean;
    cancelHandlers: boolean;
}
export default Route;
//# sourceMappingURL=route.d.ts.map