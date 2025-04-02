export declare const buildContext: contextBuilder;
type contextBuilder = (path: string, params: Context['params'], route: string) => Context;
/**
 * This is the global Context object
 * Which can be accessed from `PineconeRouter.context`
 */
export interface Context {
    readonly path: string;
    readonly route: string;
    readonly params: Record<string, string | undefined>;
}
export {};
//# sourceMappingURL=context.d.ts.map