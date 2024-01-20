import {createGasApp} from 'ham-vue3-gas/gas'
import {scripts} from '@/scripts'


createGasApp().useScripts(scripts, (global, wrapperScript) => {
    global.gasSample = wrapperScript('gasSample')
})