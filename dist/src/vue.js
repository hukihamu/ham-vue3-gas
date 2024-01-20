import { createRouter, createWebHistory } from 'vue-router';
export { createGasRouter, useScripts };
function createGasRouter(routes) {
    var router = createRouter({
        history: createWebHistory(),
        routes: routes
    });
    if (window.google) {
        router.beforeEach(function (route) {
            return route.fullPath !== '/userCodeAppPanel';
        });
        router.afterEach(function (route) {
            var _a;
            window.google.script.history.replace(undefined, route.query, route.path);
            try {
                (_a = window.top) === null || _a === void 0 ? void 0 : _a.postMessage({
                    type: 'after-each',
                    value: JSON.stringify(route),
                }, '*');
            }
            catch (e) {
                console.warn('post message to top error', e);
            }
        });
        window.google.script.url.getLocation(function (location) {
            var path = location.hash ? location.hash : '/';
            var query = location.parameter;
            router.replace({ path: path, query: query }).then();
        });
    }
    return router;
}
function useScripts() {
    return {
        send: function (name, args) {
            if (window.google) {
                return new Promise(function (resolve, reject) {
                    var run = window.google.script.run
                        .withSuccessHandler(function (it) { return resolve(JSON.parse(it.json)); })
                        .withFailureHandler(function (error) { return reject(error); })[name];
                    if (run) {
                        run(args);
                    }
                    else {
                        reject("not found GasScript: ".concat(name, " \nset \"useScripts\""));
                    }
                });
            }
            else {
                // dev server
                // TODO 環境変数
                return fetch("http://localhost:3001/".concat(name.toString()), {
                    method: 'post',
                    body: JSON.stringify(args),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(function (it) { return it.json(); }).then(function (it) { return JSON.parse(it.json); });
            }
        }
    };
}
//# sourceMappingURL=vue.js.map