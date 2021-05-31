import type { Handler } from '.';
declare class Route {
    params: {};
    path: string;
    handlers: Handler;
    constructor(path: string, handlers?: Handler);
    prototype: any;
}
export default Route;
