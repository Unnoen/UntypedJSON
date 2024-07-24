/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'UntypedJSON',
            fileName: 'untypedjson',
        },
        sourcemap: true,
        emptyOutDir: true,
    },
    test: {
        globals: true,
        coverage: {
            provider: 'v8'
        },
    },
    plugins: [dts({
        rollupTypes: true,
    })],
});
