import {createGasRouter} from 'ham-vue3-gas/vue'
import Index from '@/pages/Index.vue'
import Error from '@/pages/Error.vue'


export const router = createGasRouter([
    {
        path: '/',
        component: Index
    },
    {
        path: '/error',
        component: Error
    }
])