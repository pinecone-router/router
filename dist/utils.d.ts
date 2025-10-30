export declare const modifierValue: (modifiers: string[], key: string, fallback?: string) => string | undefined;
/**
 *
 * @param path
 */
export declare const addBasePath: (path: string) => string;
export declare const isArrayExpression: (expression: string) => boolean;
export declare const getTargetELement: (targetId?: string, globalTargetId?: string) => HTMLElement | undefined;
/**
 * Clone scripts to make them run
 * @param container: DocumentFragment | HTMLElement the element which contains
 * the scripts
 */
export declare const reloadScripts: (container: DocumentFragment | HTMLElement) => void;
//# sourceMappingURL=utils.d.ts.map