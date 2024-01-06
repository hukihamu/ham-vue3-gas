import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from "vite-plugin-singlefile"
import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify'
import {execSync} from 'child_process'


// https://vitejs.dev/config/
export default defineConfig({
    build: {
      outDir: '../dist'
    },
    plugins: [
        vue({template: {transformAssetUrls}}),
        viteSingleFile(),
        vuetify({autoImport: true}),
    ],
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            '@/': `${__dirname}/src/`
        }
    }
})
