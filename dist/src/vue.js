import { createRouter, createWebHistory } from 'vue-router';
export { createGasRouter, useScripts };
function createGasRouter(routes) {
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
    return {
        send(name, args) {
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
    };
}
//# sourceMappingURL=vue.js.map