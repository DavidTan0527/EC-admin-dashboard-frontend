import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'

import path from 'path'

export default {
    plugins: [
        vue(),
        vike()
    ],
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        }
    }
}
