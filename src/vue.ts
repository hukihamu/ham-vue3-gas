import {App, Component, createApp, SetupContext} from 'vue'
import {createRouter, createWebHistory, Router, RouteRecordRaw} from 'vue-router'
import {BaseScriptType} from './share'

export {createGasRouter, useScripts}

declare namespace window {
    namespace google {
        namespace script {
            interface Run {
                [name: string]: (...args: any) => void

                withFailureHandler(callback: (error: Error, object?: any) => void): Run

                withSuccessHandler(callback: (value: any, object?: any) => void): Run

                /**
                 * サーバには送らず、ハンドラーに渡す値をセットする
                 * @param object
                 */
                withUserObject(object: any): Run
            }

            const run: Run

            interface UrlLocation {
                hash: string
                parameter: { [key: string]: any }
                parameters: { [key: string]: any[] }
            }

            namespace history {
                function push(stateObject?: any, params?: { [key: string]: any }, hash?: string): void

                function replace(stateObject?: any, params?: { [key: string]: any }, hash?: string): void

                function setChangeHandler(callback: (event: { state: any; location: UrlLocation }) => void): void
            }
            namespace host {
                function close(): void

                function setHeight(height: number): void

                function setWidth(width: number): void

                namespace editor {
                    function focus(): void
                }
            }
            namespace url {
                function getLocation(callback: (location: UrlLocation) => void): void
            }
        }
    }
}
type CreateOptions = {
    usePlugin?: (app: App<Element>) => App<Element>
    mountContainer?: string
    vueMainScript?: (context: SetupContext) => any
    vueMainTemplate?: string
}
function createGasRouter(routes: RouteRecordRaw[]) {
    const router = createRouter({
        history: createWebHistory(),
        routes
    })
    const userCodeAppPanel = router.beforeEach(route => {
        userCodeAppPanel()
        return route.fullPath !== '/userCodeAppPanel'
    })
    router.afterEach(route => {
        window.google.script.history.replace(undefined, route.query, route.path)
    })
    window.google.script.url.getLocation(location => {
        const path = location.hash ? location.hash : '/'
        const query = location.parameter
        router.replace({ path, query }).then()
    })
    return router
}

function useScripts<T extends BaseScriptType>() {
    return {
        send<K extends keyof T>(name: Exclude<K, ''>, args?: Parameters<T[K]>[0]): Promise<ReturnType<T[K]>> {
            return new Promise((resolve, reject) => {
                const run = window.google.script.run
                    .withSuccessHandler(it => resolve(JSON.parse(it.json)))
                    .withFailureHandler(error => reject(error))[name as string]
                if (run) {
                    run(args)
                } else {
                    reject(`not found GasScript: ${name as string} \nset "useScripts"`)
                }
            })
        }
    }
}