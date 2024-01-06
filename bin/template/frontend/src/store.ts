import {defineStore} from 'pinia'
import {useScripts} from 'ham-vue3-gas/vue'
import {SampleScripts} from '@ham-vue3-gas/shared/scripts'

export const useStore = defineStore('store', {
    state() {
        return {
            counter: 0
        }
    },
})
export const scripts = useScripts<SampleScripts>()