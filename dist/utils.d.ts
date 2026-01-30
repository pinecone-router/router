import { Alpine, ElementWithXAttributes } from 'alpinejs';
export declare const modifierValue: (modifiers: string[], key: string, fallback?: string) => string | undefined;
/**
 *
 * @param path
 */
export declare const addBasePath: (path: string) => string;
export declare const isArrayExpression: (expression: string) => boolean;
export declare const getTargetELement: (targetId?: string, globalTargetId?: string) => HTMLElement | undefined;
/**
 * Clone a script to make it run after checking for x-run modifiers
 * @param script The script element to clone
 * @param index The index of the script in the template
 * @param routePath The route path associated with the template
 * @param Alpine The Alpine.js instance
 * @returns A cloned script element or undefined if it shouldn't run
 */
export declare const reloadScript: (script: ElementWithXAttributes<HTMLScriptElement>, index: number, routePath: string, Alpine: Alpine) => ElementWithXAttributes<HTMLScriptElement> | undefined;
//# sourceMappingURL=utils.d.ts.map