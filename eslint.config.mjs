import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import noBlankLinesInBlocks from './out/index.js';

export default [
    {
        ignores: ['out/**'],
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            '@inca/no-blank-lines-in-blocks': noBlankLinesInBlocks,
        },
        rules: {
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'prefer-const': 'error',
            '@inca/no-blank-lines-in-blocks/no-blank-lines-in-blocks': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector: "CallExpression[callee.property.name='forEach']",
                    message: 'Prefer for..of over .forEach.',
                },
                {
                    selector: "CallExpression[callee.property.name='reduce']",
                    message: 'Do not use .reduce for imperative loops.',
                },
            ],
        },
    },
];
