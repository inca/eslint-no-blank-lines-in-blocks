import { ESLint } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import plugin from '../out/index.js';

export const ruleName = '@inca/no-blank-lines-in-blocks/no-blank-lines-in-blocks';

export const createEslint = ({ filePath, fix = false, options = {} } = {}) => {
    const isTypeScript = filePath?.endsWith('.ts') ?? false;
    return new ESLint({
        fix,
        ignore: false,
        overrideConfigFile: true,
        overrideConfig: [
            {
                files: ['**/*.ts'],
                languageOptions: {
                    parser: tsParser,
                    parserOptions: {
                        ecmaVersion: 'latest',
                        sourceType: 'module',
                    },
                },
            },
            {
                files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
                plugins: {
                    '@inca/no-blank-lines-in-blocks': plugin,
                },
                rules: {
                    [ruleName]: ['error', options],
                },
            },
            ...(isTypeScript
                ? []
                : [
                    {
                        files: ['**/*.{js,mjs,cjs}'],
                        languageOptions: {
                            ecmaVersion: 'latest',
                            sourceType: 'module',
                        },
                    },
                ]),
        ],
    });
};

export const lint = async ({ code, filePath, fix = false, options = {} }) => {
    const eslint = createEslint({ filePath, fix, options });
    const [result] = await eslint.lintText(code, { filePath });
    return result;
};
