import {createGasApp} from 'ham-vue3-gas/gas'
import {scripts} from '@/scripts'


createGasApp({
    useGasAPI: {
        // ここにAppsScriptAPIを入れる
    }
}).useScripts(scripts, (global, wrapperScript) => {
    global.gasSample = wrapperScript('gasSample')
})