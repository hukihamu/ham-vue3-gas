import { createApp } from 'vue'
import {createVuetify} from 'vuetify'
import Default from '@/layouts/default.vue'
import {createPinia} from 'pinia'
import {router} from '@/router.ts'
import {errorHandlingPlugin} from '@/errorHandlingPlugin.ts'

createApp(Default)
    .use(router)
    .use(createPinia())
    .use(createVuetify())
    .use(errorHandlingPlugin)
    .mount('#app')
