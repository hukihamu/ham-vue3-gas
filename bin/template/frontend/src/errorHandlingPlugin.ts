import {App} from 'vue'
import {router} from '@/router.ts'

export const errorHandlingPlugin = {
    install(app: App<Element>) {
        app.config.errorHandler = (err: unknown) => {
            handler('vue', err)
            return false
        }

        // Vue.js以外のエラー
        window.addEventListener('error', (event) => {
            handler('other', event.error)
            event.preventDefault()
        })

        // Promise経由で呼び出されるエラー(Promise.reject)
        window.addEventListener('unhandledrejection', (event) => {
            handler('promise', event.reason)
            event.preventDefault()
        })
    }
}
function handler(key: 'vue' | 'other' | 'promise', error: unknown) {
    console.error(`${key} error`, error)
    router.push('/error').then()
}