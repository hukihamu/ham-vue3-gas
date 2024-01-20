import { RouteLocationNormalized, Router, RouteRecordRaw } from 'vue-router';
import { BaseScriptType } from './share';
export { createGasRouter, useScripts };
declare function createGasRouter(routes: RouteRecordRaw[], onAfterEach?: (route: RouteLocationNormalized) => void): Router;
declare function useScripts<T extends BaseScriptType>(): {
    send<K extends keyof T>(name: Exclude<K, "">, args?: Parameters<T[K]>[0] | undefined): Promise<ReturnType<T[K]>>;
};
