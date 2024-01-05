import { createRouter, createWebHistory } from 'vue-router';
export { createGasRouter, useScripts };
function initGoogleScript() {
    if (!window.google) {
        window.google = {
            // @ts-ignore
            script: {
                url: {
                    getLocation() { }
                },
                history: {
                    replace() { },
                }
            }
        };
    }
}
function createGasRouter(routes) {
    initGoogleScript();
    const router = createRouter({
        history: createWebHistory(),
        routes
    });
    const userCodeAppPanel = router.beforeEach(route => {
        userCodeAppPanel();
        return route.fullPath !== '/userCodeAppPanel';
    });
    router.afterEach(route => {
        window.google.script.history.replace(undefined, route.query, route.path);
    });
    window.google.script.url.getLocation(location => {
        const path = location.hash ? location.hash : '/';
        const query = location.parameter;
        router.replace({ path, query }).then();
    });
    return router;
}
function useScripts() {
    initGoogleScript();
    return {
        send(name, args) {
            if (window.google.script.run) {
                return new Promise((resolve, reject) => {
                    const run = window.google.script.run
                        .withSuccessHandler(it => resolve(JSON.parse(it.json)))
                        .withFailureHandler(error => reject(error))[name];
                    if (run) {
                        run(args);
                    }
                    else {
                        reject(`not found GasScript: ${name} \nset "useScripts"`);
                    }
                });
            }
            else {
                // dev server
                return fetch(`http://localhost:3001/${name.toString()}`, {
                    method: 'post',
                    body: JSON.stringify(args)
                }).then(it => it.json()).then(it => JSON.parse(it.json));
            }
        }
    };
}
//# sourceMappingURL=vue.js.map