// rollup.config.js
import ts from 'rollup-plugin-ts';

const config = [
    {
        input: 'src/index.ts',
        output: {
            file: 'lib/esm/index.js',
            format: 'es',
            sourcemap: false,
        },
        plugins: [ts(
            {
                swcConfig: {
                    minify: true,
                },
                transpiler: {
                    otherSyntax: 'swc',
                    typescriptSyntax: 'typescript',
                },
            },
        )],
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'lib/cjs/index.cjs',
            format: 'cjs',
            sourcemap: false,
        },
        plugins: [ts(
            {
                swcConfig: {
                    minify: true,
                },
                transpiler: {
                    otherSyntax: 'swc',
                    typescriptSyntax: 'typescript',
                },
            },
        )],
    },
];
export default config;
