import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(
                dirname(fileURLToPath(import.meta.url)),
                'lib/main.js'
            ),
            name: 'img-tissue',
            fileName: (format) => `img-tissue.${format}.js`,
        },
    }
})
