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
            '@': __dirname,
            '~renderer': path.resolve(__dirname, 'renderer'),
            '~layouts': path.resolve(__dirname, 'layouts'),
            '~components': path.resolve(__dirname, 'components'),
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        }
    }
}
